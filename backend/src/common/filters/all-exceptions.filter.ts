import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Every error the API returns follows this exact shape:
 *   { "error": { "code": "...", "message": "...", "details": [...] } }
 * so frontend/mobile clients can rely on one parsing path regardless of
 * which module or layer threw. Unexpected (non-HttpException) errors are
 * logged with full detail server-side but never leak internals to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorBody = { code: 'INTERNAL_ERROR', message: 'Something went wrong.' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        body = { code: this.codeForStatus(status), message: res };
      } else if (typeof res === 'object' && res !== null) {
        const r = res as Record<string, unknown>;
        body = {
          code: (r.code as string) ?? this.codeForStatus(status),
          message: Array.isArray(r.message)
            ? (r.message as string[]).join('; ')
            : ((r.message as string) ?? exception.message),
          details: r.details ?? (Array.isArray(r.message) ? r.message : undefined),
        };
      }
    } else if (exception instanceof Error) {
      // Unexpected error: log full stack server-side, return a generic message.
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({ error: body });
  }

  private codeForStatus(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'VALIDATION_ERROR';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'RATE_LIMITED';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
