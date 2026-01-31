/**
 * Database Performance Configuration
 * Custom TypeORM logger for query performance monitoring
 */

import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import { Logger } from '@nestjs/common';

export class DatabaseLogger implements TypeOrmLogger {
  private readonly logger = new Logger('DatabaseLogger');
  private readonly slowQueryThreshold = 100; // milliseconds

  /**
   * Log query execution
   */
  logQuery(
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void {
    if (process.env.DATABASE_LOGGING === 'true') {
      this.logger.debug(`Query: ${query}`);
      if (parameters && parameters.length) {
        this.logger.debug(`Parameters: ${JSON.stringify(parameters)}`);
      }
    }
  }

  /**
   * Log query errors
   */
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void {
    this.logger.error(`Query failed: ${query}`);
    this.logger.error(`Error: ${error}`);
    if (parameters && parameters.length) {
      this.logger.error(`Parameters: ${JSON.stringify(parameters)}`);
    }
  }

  /**
   * Log slow queries
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner,
  ): void {
    if (time > this.slowQueryThreshold) {
      this.logger.warn(`⚠️  Slow query detected (${time}ms): ${query}`);
      if (parameters && parameters.length) {
        this.logger.warn(`Parameters: ${JSON.stringify(parameters)}`);
      }

      // Suggestions for optimization
      if (
        query.toLowerCase().includes('select') &&
        !query.toLowerCase().includes('where')
      ) {
        this.logger.warn(
          '💡 Suggestion: Consider adding WHERE clause to filter results',
        );
      }
      if (query.toLowerCase().includes('select *')) {
        this.logger.warn(
          '💡 Suggestion: Avoid SELECT *, specify columns explicitly',
        );
      }
      if (!query.toLowerCase().includes('limit')) {
        this.logger.warn(
          '💡 Suggestion: Consider adding LIMIT to restrict result set',
        );
      }
    }
  }

  /**
   * Log schema build
   */
  logSchemaBuild(message: string, _queryRunner?: QueryRunner): void {
    this.logger.log(message);
  }

  /**
   * Log migrations
   */
  logMigration(message: string, _queryRunner?: QueryRunner): void {
    this.logger.log(message);
  }

  /**
   * Log general messages
   */
  log(
    level: 'log' | 'info' | 'warn',
    message: unknown,
    _queryRunner?: QueryRunner,
  ): void {
    switch (level) {
      case 'log':
        this.logger.log(message);
        break;
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }
}
