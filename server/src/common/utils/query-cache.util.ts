import { Repository, SelectQueryBuilder } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * Query cache configuration
 */
export interface QueryCacheConfig {
  /**
   * Cache key or identifier
   */
  id: string;

  /**
   * Cache duration in milliseconds
   */
  duration: number;
}

/**
 * Query Cache Utility
 * Provides helpers for TypeORM query result caching
 */
export class QueryCacheUtil {
  private static readonly logger = new Logger(QueryCacheUtil.name);

  /**
   * Execute query with caching
   *
   * @param queryBuilder - TypeORM query builder
   * @param cacheConfig - Cache configuration
   * @returns Query results
   *
   * @example
   * ```typescript
   * const users = await QueryCacheUtil.executeWithCache(
   *   this.usersRepository
   *     .createQueryBuilder('user')
   *     .where('user.isActive = :active', { active: true }),
   *   { id: 'active_users', duration: 60000 }
   * );
   * ```
   */
  static async executeWithCache<T>(
    queryBuilder: SelectQueryBuilder<T>,
    cacheConfig: QueryCacheConfig,
  ): Promise<T[]> {
    try {
      const results = await queryBuilder
        .cache(cacheConfig.id, cacheConfig.duration)
        .getMany();

      this.logger.debug(
        `Query executed with cache: ${cacheConfig.id} (${cacheConfig.duration}ms)`,
      );

      return results;
    } catch (error) {
      this.logger.error(
        `Query cache error for ${cacheConfig.id}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Execute single result query with caching
   *
   * @param queryBuilder - TypeORM query builder
   * @param cacheConfig - Cache configuration
   * @returns Single query result or null
   */
  static async executeOneWithCache<T>(
    queryBuilder: SelectQueryBuilder<T>,
    cacheConfig: QueryCacheConfig,
  ): Promise<T | null> {
    try {
      const result = await queryBuilder
        .cache(cacheConfig.id, cacheConfig.duration)
        .getOne();

      this.logger.debug(`Single query executed with cache: ${cacheConfig.id}`);

      return result;
    } catch (error) {
      this.logger.error(
        `Single query cache error for ${cacheConfig.id}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Execute count query with caching
   *
   * @param queryBuilder - TypeORM query builder
   * @param cacheConfig - Cache configuration
   * @returns Count result
   */
  static async executeCountWithCache<T>(
    queryBuilder: SelectQueryBuilder<T>,
    cacheConfig: QueryCacheConfig,
  ): Promise<number> {
    try {
      const count = await queryBuilder
        .cache(cacheConfig.id, cacheConfig.duration)
        .getCount();

      this.logger.debug(`Count query executed with cache: ${cacheConfig.id}`);

      return count;
    } catch (error) {
      this.logger.error(
        `Count query cache error for ${cacheConfig.id}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Generate cache key from query parameters
   *
   * @param prefix - Key prefix
   * @param params - Query parameters
   * @returns Cache key
   */
  static generateCacheKey(
    prefix: string,
    params: Record<string, unknown>,
  ): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${key}=${JSON.stringify(params[key])}`)
      .join('&');

    return `${prefix}_${sortedParams}`;
  }
}

/**
 * Repository cache mixin
 * Adds caching methods to TypeORM repositories
 */
export class CachedRepository<T> {
  constructor(private readonly repository: Repository<T>) {}

  /**
   * Find with cache
   *
   * @param options - Find options
   * @param cacheConfig - Cache configuration
   * @returns Query results
   */
  async findWithCache(
    options: Record<string, unknown>,
    cacheConfig: QueryCacheConfig,
  ): Promise<T[]> {
    const queryBuilder = this.repository.createQueryBuilder();

    // Apply find options (simplified - extend as needed)
    Object.entries(options).forEach(([key, value]) => {
      if (key === 'where') {
        queryBuilder.where(value as string);
      }
    });

    return QueryCacheUtil.executeWithCache(queryBuilder, cacheConfig);
  }

  /**
   * Find one with cache
   *
   * @param options - Find options
   * @param cacheConfig - Cache configuration
   * @returns Single result or null
   */
  async findOneWithCache(
    options: Record<string, unknown>,
    cacheConfig: QueryCacheConfig,
  ): Promise<T | null> {
    const queryBuilder = this.repository.createQueryBuilder();

    Object.entries(options).forEach(([key, value]) => {
      if (key === 'where') {
        queryBuilder.where(value as string);
      }
    });

    return QueryCacheUtil.executeOneWithCache(queryBuilder, cacheConfig);
  }
}
