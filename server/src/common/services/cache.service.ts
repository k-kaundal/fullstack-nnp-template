import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Enhanced Cache Service
 * Provides advanced caching operations with TTL, invalidation, and warming
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly DEFAULT_TTL = 60000; // 1 minute

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Get value from cache
   *
   * @param key - Cache key
   * @returns Cached value or null
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit: ${key}`);
      } else {
        this.logger.debug(`Cache miss: ${key}`);
      }
      return value || null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   *
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const cacheTtl = ttl || this.DEFAULT_TTL;
      await this.cacheManager.set(key, value, cacheTtl);
      this.logger.debug(`Cache set: ${key} (TTL: ${cacheTtl}ms)`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete value from cache
   *
   * @param key - Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error.message);
    }
  }

  /**
   * Delete multiple keys from cache
   *
   * @param keys - Array of cache keys
   */
  async deleteMany(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => this.cacheManager.del(key)));
      this.logger.debug(`Cache deleted ${keys.length} keys`);
    } catch (error) {
      this.logger.error('Cache delete many error:', error.message);
    }
  }

  /**
   * Delete all keys matching a pattern
   *
   * @param pattern - Cache key pattern (e.g., 'user_*')
   */
  async deleteByPattern(pattern: string): Promise<void> {
    try {
      // Note: This requires cache store that supports key scanning
      // For in-memory store, we'll skip this
      this.logger.debug(`Cache invalidation by pattern: ${pattern}`);
      // Implementation depends on cache store (Redis, Memcached, etc.)
    } catch (error) {
      this.logger.error(
        `Cache delete by pattern error for ${pattern}:`,
        error.message,
      );
    }
  }

  /**
   * Clear all cache entries
   * Note: Not all cache stores support this operation
   */
  async clear(): Promise<void> {
    this.logger.warn(
      'Cache clear operation not supported by current cache store',
    );
    // Note: cache-manager doesn't provide a native clear/reset method
    // For Redis or other stores, implement custom clear logic
  }

  /**
   * Get or set cache value (cache-aside pattern)
   *
   * @param key - Cache key
   * @param factory - Function to generate value if cache miss
   * @param ttl - Time to live in milliseconds (optional)
   * @returns Cached or generated value
   *
   * @example
   * ```typescript
   * const users = await cacheService.getOrSet(
   *   'users',
   *   () => this.usersRepository.find(),
   *   60000
   * );
   * ```
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value
    try {
      const value = await factory();
      await this.set(key, value, ttl);
      return value;
    } catch (error) {
      this.logger.error(`Cache factory error for key ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Warm cache with pre-calculated values
   *
   * @param entries - Map of cache keys to values
   * @param ttl - Time to live in milliseconds (optional)
   */
  async warm<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    try {
      const promises = Array.from(entries.entries()).map(([key, value]) =>
        this.set(key, value, ttl),
      );
      await Promise.all(promises);
      this.logger.log(`Cache warmed with ${entries.size} entries`);
    } catch (error) {
      this.logger.error('Cache warming error:', error.message);
    }
  }

  /**
   * Check if key exists in cache
   *
   * @param key - Cache key
   * @returns True if key exists
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Get multiple values from cache
   *
   * @param keys - Array of cache keys
   * @returns Map of keys to values
   */
  async getMany<T>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();

    await Promise.all(
      keys.map(async (key) => {
        const value = await this.get<T>(key);
        results.set(key, value);
      }),
    );

    return results;
  }

  /**
   * Set multiple values in cache
   *
   * @param entries - Map of cache keys to values
   * @param ttl - Time to live in milliseconds (optional)
   */
  async setMany<T>(entries: Map<string, T>, ttl?: number): Promise<void> {
    await Promise.all(
      Array.from(entries.entries()).map(([key, value]) =>
        this.set(key, value, ttl),
      ),
    );
  }

  /**
   * Increment numeric value in cache
   *
   * @param key - Cache key
   * @param delta - Increment amount (default: 1)
   * @returns New value
   */
  async increment(key: string, delta: number = 1): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + delta;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement numeric value in cache
   *
   * @param key - Cache key
   * @param delta - Decrement amount (default: 1)
   * @returns New value
   */
  async decrement(key: string, delta: number = 1): Promise<number> {
    return this.increment(key, -delta);
  }
}
