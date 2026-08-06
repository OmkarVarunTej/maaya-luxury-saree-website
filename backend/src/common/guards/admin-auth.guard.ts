import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Missing authorization header.',
      });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid token format. Use Bearer <token>.',
      });
    }

    const [type, token] = parts;
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid token format. Use Bearer <token>.',
      });
    }

    try {
      const secret = process.env.JWT_ADMIN_ACCESS_SECRET || 'test-admin-secret';
      const decoded = jwt.verify(token, secret);
      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token.',
      });
    }
  }
}
