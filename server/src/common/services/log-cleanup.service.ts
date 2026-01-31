import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RequestLoggerService } from './request-logger.service';

/**
 * Log Cleanup Service
 * Automatically cleans up old request logs using cron jobs
 * Runs daily at 2 AM to delete logs older than 24 hours
 */
@Injectable()
export class LogCleanupService {
  private readonly logger = new Logger(LogCleanupService.name);
  private readonly LOG_RETENTION_HOURS = 24; // Keep logs for 24 hours

  constructor(private readonly requestLoggerService: RequestLoggerService) {}

  /**
   * Scheduled cleanup job
   * Runs daily at 2:00 AM
   * Deletes request logs older than 24 hours
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOldLogs(): Promise<void> {
    this.logger.log(
      `Starting scheduled cleanup of request logs older than ${this.LOG_RETENTION_HOURS} hours`,
    );

    try {
      const deletedCount = await this.requestLoggerService.deleteOldLogs(
        this.LOG_RETENTION_HOURS,
      );

      this.logger.log(
        `Cleanup completed: Deleted ${deletedCount} old request logs`,
      );
    } catch (error) {
      this.logger.error('Cleanup job failed:', error.message);
    }
  }

  /**
   * Manual cleanup trigger
   * Can be called from admin endpoints
   *
   * @param hours - Hours threshold (default: 24)
   * @returns Number of deleted logs
   */
  async triggerCleanup(
    hours: number = this.LOG_RETENTION_HOURS,
  ): Promise<number> {
    this.logger.log(
      `Manual cleanup triggered for logs older than ${hours} hours`,
    );

    try {
      const deletedCount = await this.requestLoggerService.deleteOldLogs(hours);
      this.logger.log(`Manual cleanup completed: Deleted ${deletedCount} logs`);
      return deletedCount;
    } catch (error) {
      this.logger.error('Manual cleanup failed:', error.message);
      return 0;
    }
  }

  /**
   * Get cleanup statistics
   * Shows when last cleanup ran and how many logs are stored
   */
  async getCleanupStats(): Promise<{
    totalLogs: number;
    todayLogs: number;
    retentionHours: number;
    nextCleanup: string;
  }> {
    const stats = await this.requestLoggerService.getStatistics();

    // Next cleanup is daily at 2 AM
    const now = new Date();
    const nextCleanup = new Date(now);
    nextCleanup.setHours(2, 0, 0, 0);

    // If already past 2 AM today, set to tomorrow
    if (now.getHours() >= 2) {
      nextCleanup.setDate(nextCleanup.getDate() + 1);
    }

    return {
      totalLogs: stats.total,
      todayLogs: stats.today,
      retentionHours: this.LOG_RETENTION_HOURS,
      nextCleanup: nextCleanup.toISOString(),
    };
  }
}
