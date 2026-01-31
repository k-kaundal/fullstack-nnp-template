/**
 * Versioning Interceptor
 * Adds deprecation warnings to response headers
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import {
  API_DEPRECATED_KEY,
  API_DEPRECATION_INFO_KEY,
  DeprecationInfo,
} from '../decorators/api-version.decorator';

@Injectable()
export class VersioningInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const handler = context.getHandler();
    const isDeprecated = this.reflector.get<boolean>(
      API_DEPRECATED_KEY,
      handler,
    );

    if (!isDeprecated) {
      return next.handle();
    }

    const deprecationInfo = this.reflector.get<DeprecationInfo>(
      API_DEPRECATION_INFO_KEY,
      handler,
    );

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();

        // Add deprecation warning headers
        response.setHeader('X-API-Deprecated', 'true');
        response.setHeader(
          'X-API-Deprecation-Date',
          deprecationInfo.deprecatedAt,
        );

        if (deprecationInfo.sunsetDate) {
          response.setHeader('X-API-Sunset', deprecationInfo.sunsetDate);
          response.setHeader('Sunset', deprecationInfo.sunsetDate);
        }

        if (deprecationInfo.alternativeEndpoint) {
          response.setHeader(
            'X-API-Alternative',
            deprecationInfo.alternativeEndpoint,
          );
        }

        // Standard deprecation warning
        const warningMessage = `299 - "Deprecated API${deprecationInfo.sunsetDate ? ` - Sunset: ${deprecationInfo.sunsetDate}` : ''}"`;
        response.setHeader('Warning', warningMessage);
        response.setHeader('X-API-Warn', warningMessage);
      }),
    );
  }
}
