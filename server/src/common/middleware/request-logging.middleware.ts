import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { LoggerService } from '../logger/logger.service';

/**
 * Extend Express Request to include correlation ID
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId?: string;
      startTime?: number;
    }
  }
}

/**
 * Request Logging Middleware
 * Logs all HTTP requests with correlation IDs for request tracking
 *
 * Features:
 * - Generates unique correlation ID for each request
 * - Logs request details (method, URL, IP, user agent)
 * - Logs response details (status code, response time)
 * - Adds correlation ID to response headers
 * - Tracks request duration
 * - Sanitizes sensitive data from logs
 */
@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('RequestLogger');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Generate or extract correlation ID
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID();

    // Attach correlation ID to request
    req.correlationId = correlationId;
    req.startTime = Date.now();

    // Add correlation ID to response headers
    res.setHeader('X-Correlation-Id', correlationId);

    // Extract request metadata
    const { method, originalUrl, ip, headers } = req;
    const userAgent = headers['user-agent'] || 'Unknown';
    const userId = (req.user as { sub?: string })?.sub;

    // Skip analytics tracking endpoint to prevent log pollution
    if (originalUrl.includes('/analytics/track')) {
      next();
      return;
    }

    // Only track POST and PATCH requests (skip GET, DELETE, etc.)
    const shouldTrack = method === 'POST' || method === 'PATCH';

    // Log incoming request
    this.logger.log('Incoming request', 'RequestLogger', {
      correlationId,
      method,
      url: originalUrl,
      ip,
      userAgent,
      userId,
      type: 'incoming_request',
      willTrack: shouldTrack,
    });

    // Capture response
    const originalSend = res.send;
    const logger = this.logger; // Capture logger instance for closure
    res.send = function (data): Response {
      const responseTime = Date.now() - (req.startTime || Date.now());
      const { statusCode } = res;

      // Log request completion (only POST and PATCH)
      if (shouldTrack) {
        logger.logRequest(
          method,
          originalUrl,
          statusCode,
          responseTime,
          correlationId,
          {
            ip,
            userAgent,
            userId,
            responseSize:
              typeof data === 'string'
                ? data.length
                : JSON.stringify(data).length,
          },
        );
      }

      // Log slow requests (>1000ms)
      if (responseTime > 1000) {
        logger.warn('Slow request detected', 'RequestLogger', {
          correlationId,
          method,
          url: originalUrl,
          responseTime,
        });
      }

      // Log errors (4xx, 5xx)
      if (statusCode >= 400) {
        const level = statusCode >= 500 ? 'error' : 'warn';
        const message = 'Request failed';
        if (level === 'error') {
          logger.error(message, undefined, 'RequestLogger', {
            correlationId,
            method,
            url: originalUrl,
            statusCode,
            responseTime,
          });
        } else {
          logger.warn(message, 'RequestLogger', {
            correlationId,
            method,
            url: originalUrl,
            statusCode,
            responseTime,
          });
        }
      }

      return originalSend.call(this, data);
    };

    next();
  }
}

/**
 * Correlation ID Middleware
 * Simpler middleware that only handles correlation ID generation
 * Use this if you don't need full request logging
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID();

    req.correlationId = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);

    next();
  }
}
