import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { RequestLog } from '../entities/request-log.entity';
import { Request, Response } from 'express';

/**
 * Request log data interface
 */
export interface RequestLogData {
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: string;
  queryParams?: string;
  errorMessage?: string;
}

/**
 * Request Logger Service
 * Saves HTTP request logs to database for tracking and auditing
 */
@Injectable()
export class RequestLoggerService {
  private readonly logger = new Logger(RequestLoggerService.name);
  private readonly SENSITIVE_FIELDS = [
    'password',
    'token',
    'secret',
    'apiKey',
    'refreshToken',
  ];

  constructor(
    @InjectRepository(RequestLog)
    private readonly requestLogRepository: Repository<RequestLog>,
  ) {}

  /**
   * Log HTTP request to database
   *
   * @param data - Request log data
   */
  async logRequest(data: RequestLogData): Promise<void> {
    try {
      const log = this.requestLogRepository.create(data);
      await this.requestLogRepository.save(log);

      this.logger.debug(
        `Request logged: ${data.method} ${data.path} - ${data.statusCode} (${data.responseTime}ms)`,
      );
    } catch (error) {
      this.logger.error('Failed to save request log:', error.message);
    }
  }

  /**
   * Extract request log data from Express request and response
   *
   * @param req - Express request
   * @param res - Express response
   * @param responseTime - Response time in milliseconds
   * @param error - Error object (if request failed)
   * @returns Request log data
   */
  extractLogData(
    req: Request,
    res: Response,
    responseTime: number,
    error?: Error,
  ): RequestLogData {
    // Extract user ID from JWT payload
    const user = (req as Request & { user?: { sub?: string } }).user;
    const userId = user?.sub;

    // Extract IP address
    const ipAddress = this.extractIpAddress(req);

    // Sanitize request body
    const requestBody = this.sanitizeBody(req.body);

    // Extract query parameters
    const queryParams = Object.keys(req.query).length
      ? JSON.stringify(req.query)
      : undefined;

    return {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime,
      userId,
      ipAddress,
      userAgent: req.headers['user-agent'],
      requestBody,
      queryParams,
      errorMessage: error?.message,
    };
  }

  /**
   * Extract IP address from request
   *
   * @param req - Express request
   * @returns IP address
   */
  private extractIpAddress(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const socketIp = req.socket.remoteAddress;

    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    }

    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    return socketIp || 'unknown';
  }

  /**
   * Sanitize request body to remove sensitive fields
   *
   * @param body - Request body object
   * @returns Sanitized body as JSON string
   */
  private sanitizeBody(body: Record<string, unknown>): string | undefined {
    if (!body || Object.keys(body).length === 0) {
      return undefined;
    }

    try {
      const sanitized = { ...body };

      // Remove sensitive fields
      this.SENSITIVE_FIELDS.forEach((field) => {
        if (field in sanitized) {
          sanitized[field] = '***REDACTED***';
        }
      });

      return JSON.stringify(sanitized);
    } catch (error) {
      this.logger.error('Failed to sanitize request body:', error.message);
      return undefined;
    }
  }

  /**
   * Get request logs with pagination
   *
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated request logs
   */
  async getRequestLogs(
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: RequestLog[]; total: number }> {
    const [logs, total] = await this.requestLogRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, total };
  }

  /**
   * Get request logs for specific user
   *
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns User's request logs
   */
  async getUserRequestLogs(
    userId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ logs: RequestLog[]; total: number }> {
    const [logs, total] = await this.requestLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { logs, total };
  }

  /**
   * Delete request logs older than specified hours
   *
   * @param hours - Hours threshold (default: 24)
   * @returns Number of deleted logs
   */
  async deleteOldLogs(hours: number = 24): Promise<number> {
    try {
      const threshold = new Date();
      threshold.setHours(threshold.getHours() - hours);

      this.logger.log(
        `Deleting logs older than: ${threshold.toISOString()} (${hours} hours ago)`,
      );

      // First check how many logs exist that match criteria
      const count = await this.requestLogRepository.count({
        where: {
          createdAt: LessThan(threshold),
        },
      });

      this.logger.log(
        `Found ${count} logs older than ${hours} hours to delete`,
      );

      if (count === 0) {
        this.logger.log('No old logs found to delete');
        return 0;
      }

      const result = await this.requestLogRepository.delete({
        createdAt: LessThan(threshold),
      });

      const deletedCount = result.affected || 0;

      this.logger.log(
        `Deleted ${deletedCount} request logs older than ${hours} hours`,
      );

      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to delete old request logs:', error.message);
      return 0;
    }
  }

  /**
   * Get request statistics
   *
   * @returns Request statistics
   */
  async getStatistics(): Promise<{
    total: number;
    today: number;
    errors: number;
    averageResponseTime: number;
  }> {
    const total = await this.requestLogRepository.count();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const today = await this.requestLogRepository.count({
      where: { createdAt: LessThan(new Date()) },
    });

    const errors = await this.requestLogRepository.count({
      where: { statusCode: LessThan(200) },
    });

    const avgResult = await this.requestLogRepository
      .createQueryBuilder('log')
      .select('AVG(log.responseTime)', 'avg')
      .getRawOne();

    const averageResponseTime = avgResult?.avg
      ? Math.round(parseFloat(avgResult.avg))
      : 0;

    return { total, today, errors, averageResponseTime };
  }
}
