/**
 * Custom Rate Limiting Decorators
 * Provides flexible rate limiting for different endpoints
 */

import { SetMetadata } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

/**
 * Metadata key for custom rate limit configuration
 */
export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
  ttl: number; // Time window in milliseconds
  limit: number; // Maximum requests per time window
  message?: string; // Custom error message
}

/**
 * Apply custom rate limiting to an endpoint
 *
 * @param ttl - Time window in milliseconds
 * @param limit - Maximum requests per time window
 * @param message - Custom error message
 *
 * @example
 * ```typescript
 * @RateLimit(60000, 10) // 10 requests per minute
 * @Post('login')
 * async login() {}
 * ```
 */
export const RateLimit = (
  ttl: number,
  limit: number,
  message?: string,
): MethodDecorator => {
  return (
    target: unknown,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(RATE_LIMIT_KEY, { ttl, limit, message })(
      target,
      propertyKey,
      descriptor,
    );
    Throttle({ default: { ttl, limit } })(target, propertyKey, descriptor);
  };
};

/**
 * Apply strict rate limiting (10 requests per minute)
 * Use for sensitive operations like password reset, account deletion
 *
 * @example
 * ```typescript
 * @StrictRateLimit()
 * @Post('reset-password')
 * async resetPassword() {}
 * ```
 */
export const StrictRateLimit = (): MethodDecorator => {
  return RateLimit(60000, 10, 'Too many attempts, please try again later');
};

/**
 * Apply auth rate limiting (5 requests per 15 minutes)
 * Use for authentication endpoints to prevent brute force attacks
 *
 * @example
 * ```typescript
 * @AuthRateLimit()
 * @Post('login')
 * async login() {}
 * ```
 */
export const AuthRateLimit = (): MethodDecorator => {
  return RateLimit(
    900000,
    5,
    'Too many login attempts, please try again in 15 minutes',
  );
};

/**
 * Apply generous rate limiting (1000 requests per minute)
 * Use for public, read-only endpoints
 *
 * @example
 * ```typescript
 * @PublicRateLimit()
 * @Get('health')
 * async healthCheck() {}
 * ```
 */
export const PublicRateLimit = (): MethodDecorator => {
  return RateLimit(60000, 1000);
};

/**
 * Skip rate limiting for specific endpoint
 * Use carefully, only for internal or health check endpoints
 *
 * @example
 * ```typescript
 * @SkipRateLimit()
 * @Get('internal/metrics')
 * async getMetrics() {}
 * ```
 */
export const SkipRateLimit = (): MethodDecorator => {
  return Throttle({ default: { ttl: 0, limit: 0 } });
};

/**
 * Apply per-user rate limiting
 * Limits requests per authenticated user instead of IP
 *
 * @param ttl - Time window in milliseconds
 * @param limit - Maximum requests per time window per user
 *
 * @example
 * ```typescript
 * @UserRateLimit(60000, 50) // 50 requests per minute per user
 * @Post('upload')
 * async upload() {}
 * ```
 */
export const UserRateLimit = (ttl: number, limit: number): MethodDecorator => {
  return SetMetadata('userRateLimit', { ttl, limit });
};
