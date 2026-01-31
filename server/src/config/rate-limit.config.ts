/**
 * Rate Limiting Configuration
 * Controls request throttling for API protection
 * Environment-aware: Generous limits for development, strict for production
 */

import { ThrottlerModuleOptions } from '@nestjs/throttler';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Get rate limit value from environment with fallback
 * @param envKey - Environment variable key
 * @param devDefault - Default value for development
 * @param prodDefault - Default value for production
 * @returns Configured or default value
 */
const getRateLimitValue = (
  envKey: string,
  devDefault: number,
  prodDefault: number,
): number => {
  const envValue = process.env[envKey];
  if (envValue) {
    return parseInt(envValue, 10);
  }
  return isDevelopment ? devDefault : prodDefault;
};

/**
 * Environment-aware rate limiting configuration
 * All values configurable via environment variables
 * - Fallback to generous limits in development
 * - Fallback to strict limits in production
 */
export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      name: 'default',
      ttl: getRateLimitValue(
        'RATE_LIMIT_DEFAULT_TTL',
        300000, // Dev: 5 minutes
        60000, // Prod: 1 minute
      ),
      limit: getRateLimitValue(
        'RATE_LIMIT_DEFAULT_MAX',
        2000, // Dev: 2000 requests
        100, // Prod: 100 requests
      ),
    },
    {
      name: 'strict',
      ttl: getRateLimitValue(
        'RATE_LIMIT_STRICT_TTL',
        300000, // Dev: 5 minutes
        60000, // Prod: 1 minute
      ),
      limit: getRateLimitValue(
        'RATE_LIMIT_STRICT_MAX',
        500, // Dev: 500 requests
        10, // Prod: 10 requests
      ),
    },
    {
      name: 'auth',
      ttl: getRateLimitValue(
        'RATE_LIMIT_AUTH_TTL',
        1800000, // Dev: 30 minutes
        900000, // Prod: 15 minutes
      ),
      limit: getRateLimitValue(
        'RATE_LIMIT_AUTH_MAX',
        100, // Dev: 100 attempts
        5, // Prod: 5 attempts
      ),
    },
  ],

  // Skip if rate limit is disabled via env
  skipIf: () => process.env.RATE_LIMIT_ENABLED === 'false',

  // Error message
  errorMessage: 'Too many requests, please try again later',
};

/**
 * IP-based rate limit storage
 * Tracks requests per IP address
 */
export interface RateLimitInfo {
  ip: string;
  userId?: string;
  endpoint: string;
  count: number;
  resetTime: Date;
}
