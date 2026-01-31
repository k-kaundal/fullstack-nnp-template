import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Custom Winston Logger Service
 * Provides structured logging with multiple transports and log rotation
 *
 * Features:
 * - Multiple log levels (error, warn, info, debug)
 * - Console logging with colors (development)
 * - File logging with daily rotation
 * - JSON format for production
 * - Correlation ID support
 * - Request/Response logging
 * - Error stack traces
 * - Performance metrics
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;
  private context: string;

  constructor(private readonly configService: ConfigService) {
    this.context = 'Application';
    this.logger = this.createLogger();
  }

  /**
   * Set context for this logger instance
   */
  setContext(context: string): void {
    this.context = context;
  }

  /**
   * Create Winston logger instance with transports
   */
  private createLogger(): winston.Logger {
    const env = this.configService.get('NODE_ENV', 'development');
    const logLevel = this.configService.get('LOG_LEVEL', 'info');
    const logDir = this.configService.get('LOG_DIR', 'src/logs');

    const transports: winston.transport[] = [];

    // Console transport (always enabled)
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          env === 'production'
            ? winston.format.json()
            : winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(
                  ({
                    timestamp,
                    level,
                    message,
                    context,
                    correlationId,
                    ...meta
                  }) => {
                    let log = `${timestamp} [${level}]`;

                    if (correlationId) {
                      log += ` [${correlationId}]`;
                    }

                    if (context) {
                      log += ` [${context}]`;
                    }

                    log += ` ${message}`;

                    if (Object.keys(meta).length > 0) {
                      log += ` ${JSON.stringify(meta)}`;
                    }

                    return log;
                  },
                ),
              ),
        ),
      }),
    );

    // File transport - Error logs
    if (env !== 'test') {
      transports.push(
        new DailyRotateFile({
          level: 'error',
          dirname: logDir,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
            winston.format.json(),
          ),
        }),
      );

      // File transport - Combined logs
      transports.push(
        new DailyRotateFile({
          level: logLevel,
          dirname: logDir,
          filename: 'combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );

      // File transport - Access logs (info level)
      transports.push(
        new DailyRotateFile({
          level: 'info',
          dirname: logDir,
          filename: 'access-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '7d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      );
    }

    return winston.createLogger({
      level: logLevel,
      transports,
      // Exit on error: false to handle errors gracefully
      exitOnError: false,
    });
  }

  /**
   * Log with correlation ID from request context
   */
  private logWithContext(
    level: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    const logMeta = {
      context: this.context,
      ...meta,
    };

    this.logger.log(level, message, logMeta);
  }

  /**
   * Log informational message
   */
  log(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logWithContext('info', message, {
      context: context || this.context,
      ...meta,
    });
  }

  /**
   * Log error message with stack trace
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext('error', message, {
      context: context || this.context,
      trace,
      ...meta,
    });
  }

  /**
   * Log warning message
   */
  warn(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext('warn', message, {
      context: context || this.context,
      ...meta,
    });
  }

  /**
   * Log debug message
   */
  debug(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext('debug', message, {
      context: context || this.context,
      ...meta,
    });
  }

  /**
   * Log verbose message
   */
  verbose(
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext('verbose', message, {
      context: context || this.context,
      ...meta,
    });
  }

  /**
   * Log HTTP request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    correlationId?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext(
      'info',
      `${method} ${url} ${statusCode} ${responseTime}ms`,
      {
        method,
        url,
        statusCode,
        responseTime,
        correlationId,
        type: 'http_request',
        ...meta,
      },
    );
  }

  /**
   * Log database query
   */
  logQuery(
    query: string,
    duration: number,
    correlationId?: string,
    meta?: Record<string, unknown>,
  ): void {
    const isSlow = duration > 100; // Slow query threshold: 100ms

    this.logWithContext(
      isSlow ? 'warn' : 'debug',
      `Query executed in ${duration}ms`,
      {
        query,
        duration,
        correlationId,
        type: 'database_query',
        isSlow,
        ...meta,
      },
    );
  }

  /**
   * Log external API call
   */
  logExternalAPI(
    service: string,
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    correlationId?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext(
      'info',
      `External API: ${service} ${method} ${url} ${statusCode} ${duration}ms`,
      {
        service,
        method,
        url,
        statusCode,
        duration,
        correlationId,
        type: 'external_api',
        ...meta,
      },
    );
  }

  /**
   * Log business event
   */
  logEvent(
    event: string,
    userId?: string,
    correlationId?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext('info', `Event: ${event}`, {
      event,
      userId,
      correlationId,
      type: 'business_event',
      ...meta,
    });
  }

  /**
   * Log security event
   */
  logSecurity(
    event: string,
    userId?: string,
    ip?: string,
    correlationId?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logWithContext('warn', `Security: ${event}`, {
      event,
      userId,
      ip,
      correlationId,
      type: 'security_event',
      ...meta,
    });
  }

  /**
   * Log performance metric
   */
  logPerformance(
    operation: string,
    duration: number,
    correlationId?: string,
    meta?: Record<string, unknown>,
  ): void {
    const level = duration > 1000 ? 'warn' : 'debug'; // Slow operation: >1s

    this.logWithContext(level, `Performance: ${operation} took ${duration}ms`, {
      operation,
      duration,
      correlationId,
      type: 'performance',
      ...meta,
    });
  }

  /**
   * Create child logger with specific context
   */
  child(context: string): LoggerService {
    const childLogger = new LoggerService(this.configService);
    childLogger.setContext(context);
    return childLogger;
  }
}
