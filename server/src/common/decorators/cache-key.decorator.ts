import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for custom cache keys
 */
export const CACHE_KEY_METADATA = 'cache_key_metadata';

/**
 * Custom cache key decorator
 * Allows defining custom cache keys for methods
 *
 * @param key - Cache key prefix
 * @returns MethodDecorator
 *
 * @example
 * ```typescript
 * @CacheKey('user')
 * async findOne(id: string) {
 *   // Cache key will be: user_${id}
 * }
 * ```
 */
export const CacheKey = (key: string) => SetMetadata(CACHE_KEY_METADATA, key);
