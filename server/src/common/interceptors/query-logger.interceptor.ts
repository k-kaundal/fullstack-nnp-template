/**
 * Query Logger Interceptor
 * Logs slow queries and provides performance metrics
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class QueryLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('QueryLogger');
  private readonly slowQueryThreshold = 100; // milliseconds

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        // Log slow queries
        if (duration > this.slowQueryThreshold) {
          this.logger.warn(
            `⚠️  Slow query detected: ${method} ${url} - ${duration}ms`,
          );
        }

        // Log all queries in development
        if (process.env.NODE_ENV === 'development') {
          this.logger.debug(`${method} ${url} - ${duration}ms`);
        }
      }),
    );
  }
}
