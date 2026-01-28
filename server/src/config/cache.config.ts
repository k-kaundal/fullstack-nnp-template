import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

/**
 * Cache configuration factory
 * Creates cache configuration with environment-based settings
 *
 * @param configService - NestJS ConfigService for accessing environment variables
 * @returns CacheModuleOptions - Cache configuration options
 *
 * @example
 * ```typescript
 * CacheModule.forRootAsync({
 *   inject: [ConfigService],
 *   useFactory: cacheConfig,
 * })
 * ```
 */
export const cacheConfig = (
  configService: ConfigService,
): CacheModuleOptions => {
  const ttl = configService.get<number>('CACHE_TTL') || 60000; // 1 minute default
  const max = configService.get<number>('CACHE_MAX_ITEMS') || 100; // 100 items default

  return {
    ttl, // Time to live in milliseconds
    max, // Maximum number of items in cache
    isGlobal: true, // Make cache available globally
  };
};
