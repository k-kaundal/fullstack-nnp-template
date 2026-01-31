import { SetMetadata } from '@nestjs/common';

/**
 * Cache decorator metadata keys
 */
export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';
export const CACHE_INVALIDATE_METADATA = 'cache:invalidate';

/**
 * Cache options interface
 */
export interface CacheOptions {
  /**
   * Cache key or key prefix
   */
  key?: string;

  /**
   * Time to live in milliseconds
   */
  ttl?: number;

  /**
   * Whether to use request parameters in cache key
   */
  useParams?: boolean;

  /**
   * Whether to use request body in cache key
   */
  useBody?: boolean;
}

/**
 * Invalidation options interface
 */
export interface InvalidationOptions {
  /**
   * Cache keys or patterns to invalidate
   */
  keys: string[];

  /**
   * Whether to use wildcard matching
   */
  useWildcard?: boolean;
}

/**
 * Decorator to enable caching for a method
 * Caches the return value with configurable TTL
 *
 * @param options - Cache options
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @Cacheable({ key: 'users', ttl: 60000 })
 * async getUsers() {
 *   return this.usersRepository.find();
 * }
 * ```
 */
export const Cacheable = (options: CacheOptions = {}) => {
  return (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    SetMetadata(CACHE_KEY_METADATA, options.key || propertyKey)(
      target,
      propertyKey,
      descriptor,
    );
    if (options.ttl) {
      SetMetadata(CACHE_TTL_METADATA, options.ttl)(
        target,
        propertyKey,
        descriptor,
      );
    }
    return descriptor;
  };
};

/**
 * Decorator to invalidate cache after method execution
 * Removes specified cache keys after successful method execution
 *
 * @param options - Invalidation options
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @CacheInvalidate({ keys: ['users', 'user_list'] })
 * async createUser(data: CreateUserDto) {
 *   return this.usersRepository.save(data);
 * }
 * ```
 */
export const CacheInvalidate = (options: InvalidationOptions) => {
  return SetMetadata(CACHE_INVALIDATE_METADATA, options);
};

/**
 * Decorator to set custom cache TTL
 * Overrides default TTL for specific methods
 *
 * @param ttl - Time to live in milliseconds
 * @returns Method decorator
 *
 * @example
 * ```typescript
 * @CacheTTL(300000) // 5 minutes
 * async getConfiguration() {
 *   return this.configRepository.findOne();
 * }
 * ```
 */
export const CacheTTL = (ttl: number) => {
  return SetMetadata(CACHE_TTL_METADATA, ttl);
};
