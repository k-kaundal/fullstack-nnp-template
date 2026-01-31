import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA } from '../decorators/cache-key.decorator';
import { Request } from 'express';

/**
 * Custom cache interceptor for caching service responses
 * Caches responses based on method parameters and custom cache keys
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  /**
   * Intercepts method calls to implement caching
   *
   * @param context - Execution context
   * @param next - Call handler
   * @returns Observable with cached or fresh data
   */
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    // Get custom cache key from decorator metadata
    const cacheKeyPrefix =
      this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler()) ||
      '';

    // Generate cache key from request parameters
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(cacheKeyPrefix, request);

    // Try to get cached data
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return of(cachedData);
    }

    // If not in cache, execute handler and cache the result
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data);
      }),
    );
  }

  /**
   * Generates cache key from prefix and request parameters
   *
   * @param prefix - Cache key prefix
   * @param request - Express request object
   * @returns Generated cache key
   */
  private generateCacheKey(prefix: string, request: Request): string {
    const { url, params, query } = request;
    const paramsStr = JSON.stringify(params);
    const queryStr = JSON.stringify(query);

    return `${prefix}_${url}_${paramsStr}_${queryStr}`;
  }
}
