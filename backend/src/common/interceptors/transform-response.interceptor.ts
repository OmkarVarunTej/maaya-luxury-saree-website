import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Paginated<T> {
  data: T[];
  meta: { page: number; perPage: number; total: number; totalPages: number };
}

/**
 * Lets a service return the plain shape { items, page, perPage, total } for
 * list endpoints and normalizes it to the documented envelope:
 *   { "data": [...], "meta": { "page", "perPage", "total", "totalPages" } }
 * Non-list responses pass through untouched.
 */
@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, T | Paginated<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<T | Paginated<T>> {
    return next.handle().pipe(
      map((result) => {
        if (result && typeof result === 'object' && 'items' in result && 'total' in result) {
          const r = result as unknown as {
            items: T[];
            page: number;
            perPage: number;
            total: number;
          };
          return {
            data: r.items,
            meta: {
              page: r.page,
              perPage: r.perPage,
              total: r.total,
              totalPages: Math.max(1, Math.ceil(r.total / r.perPage)),
            },
          };
        }
        return result;
      }),
    );
  }
}
