import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CacheService } from './cache.service';

/**
 * Cache warming entry configuration
 */
export interface CacheWarmingEntry<T> {
  /**
   * Cache key
   */
  key: string;

  /**
   * Factory function to generate value
   */
  factory: () => Promise<T>;

  /**
   * Time to live in milliseconds
   */
  ttl?: number;

  /**
   * Whether to warm on application start
   */
  warmOnStart?: boolean;

  /**
   * Cron schedule for periodic warming (optional)
   */
  schedule?: string;
}

/**
 * Cache Warming Service
 * Pre-populates cache with frequently accessed data
 * Reduces initial request latency
 */
@Injectable()
export class CacheWarmingService implements OnModuleInit {
  private readonly logger = new Logger(CacheWarmingService.name);
  private warmingEntries: Array<CacheWarmingEntry<unknown>> = [];

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Lifecycle hook - warm cache on module initialization
   */
  async onModuleInit() {
    await this.warmOnStartup();
  }

  /**
   * Register cache warming entry
   *
   * @param entry - Cache warming configuration
   */
  register<T>(entry: CacheWarmingEntry<T>): void {
    this.warmingEntries.push(entry as CacheWarmingEntry<unknown>);
    this.logger.log(`Registered cache warming entry: ${entry.key}`);
  }

  /**
   * Warm cache with all registered entries that have warmOnStart=true
   */
  private async warmOnStartup(): Promise<void> {
    const startupEntries = this.warmingEntries.filter(
      (entry) => entry.warmOnStart,
    );

    if (startupEntries.length === 0) {
      this.logger.debug('No cache entries configured for startup warming');
      return;
    }

    this.logger.log(
      `Warming cache with ${startupEntries.length} entries on startup...`,
    );

    await Promise.all(startupEntries.map((entry) => this.warmEntry(entry.key)));

    this.logger.log('Cache warming on startup completed');
  }

  /**
   * Warm specific cache entry
   *
   * @param key - Cache key to warm
   */
  async warmEntry(key: string): Promise<void> {
    const entry = this.warmingEntries.find((e) => e.key === key);

    if (!entry) {
      this.logger.warn(`Cache warming entry not found: ${key}`);
      return;
    }

    try {
      this.logger.debug(`Warming cache entry: ${key}`);
      const value = await entry.factory();
      await this.cacheService.set(key, value, entry.ttl);
      this.logger.log(`Cache entry warmed successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to warm cache entry ${key}:`, error.message);
    }
  }

  /**
   * Warm all registered cache entries
   */
  async warmAll(): Promise<void> {
    this.logger.log(`Warming all ${this.warmingEntries.length} cache entries`);

    await Promise.all(
      this.warmingEntries.map((entry) => this.warmEntry(entry.key)),
    );

    this.logger.log('All cache entries warmed');
  }

  /**
   * Scheduled cache warming (runs every hour)
   * Refreshes cache entries to prevent expiration
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledWarming(): Promise<void> {
    const scheduledEntries = this.warmingEntries.filter(
      (entry) => entry.schedule,
    );

    if (scheduledEntries.length === 0) {
      return;
    }

    this.logger.log(
      `Running scheduled cache warming for ${scheduledEntries.length} entries`,
    );

    await Promise.all(
      scheduledEntries.map((entry) => this.warmEntry(entry.key)),
    );
  }

  /**
   * Get all registered warming entries
   */
  getEntries(): Array<CacheWarmingEntry<unknown>> {
    return [...this.warmingEntries];
  }

  /**
   * Clear all warming entries
   */
  clear(): void {
    this.warmingEntries = [];
    this.logger.log('All cache warming entries cleared');
  }

  /**
   * Remove specific warming entry
   *
   * @param key - Cache key to remove
   */
  remove(key: string): void {
    const initialLength = this.warmingEntries.length;
    this.warmingEntries = this.warmingEntries.filter((e) => e.key !== key);

    if (this.warmingEntries.length < initialLength) {
      this.logger.log(`Removed cache warming entry: ${key}`);
    }
  }
}
