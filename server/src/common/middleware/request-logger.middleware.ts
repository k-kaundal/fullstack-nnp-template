import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RequestLoggerService } from '../services/request-logger.service';

/**
 * Request Logger Middleware
 * Captures HTTP requests and saves them to database
 * Measures response time and logs errors
 */
@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestLoggerMiddleware.name);

  constructor(private readonly requestLoggerService: RequestLoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Capture response finish event
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;

      // Extract log data
      const logData = this.requestLoggerService.extractLogData(
        req,
        res,
        responseTime,
      );

      // Save to database asynchronously (don't block response)
      this.requestLoggerService.logRequest(logData).catch((error) => {
        this.logger.error('Failed to log request:', error.message);
      });
    });

    // Capture errors
    res.on('error', (error: Error) => {
      const responseTime = Date.now() - startTime;

      const logData = this.requestLoggerService.extractLogData(
        req,
        res,
        responseTime,
        error,
      );

      this.requestLoggerService.logRequest(logData).catch((err) => {
        this.logger.error('Failed to log error request:', err.message);
      });
    });

    next();
  }
}
