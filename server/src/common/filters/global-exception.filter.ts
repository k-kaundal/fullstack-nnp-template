import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import { BaseException } from '../exceptions/custom-exceptions';
import * as Sentry from '@sentry/node';

/**
 * Global Exception Filter
 * Catches all exceptions and provides consistent error responses
 *
 * Features:
 * - Consistent error response format
 * - Environment-aware error messages (detailed in dev, generic in prod)
 * - Automatic error logging with correlation IDs
 * - Sentry integration for error monitoring
 * - Stack trace inclusion in development
 * - Operational vs programmer error distinction
 * - Error code standardization
 * - Sensitive data sanitization
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly isDevelopment: boolean;
  private readonly isProduction: boolean;
  private readonly sentryEnabled: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const env = this.configService.get('NODE_ENV', 'development');
    this.isDevelopment = env === 'development';
    this.isProduction = env === 'production';
    this.sentryEnabled =
      this.configService.get('SENTRY_ENABLED', 'false') === 'true';
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { correlationId?: string }>();

    const correlationId = request.correlationId || 'N/A';
    const path = request.url;
    const method = request.method;
    const timestamp = new Date().toISOString();

    // Determine error details
    const errorDetails = this.extractErrorDetails(exception);

    // Log error
    this.logError(exception, errorDetails, request, correlationId);

    // Send to Sentry if enabled
    if (this.sentryEnabled && !errorDetails.isOperational) {
      this.sendToSentry(exception, request, correlationId);
    }

    // Build error response
    const errorResponse = this.buildErrorResponse(
      errorDetails,
      path,
      method,
      timestamp,
      correlationId,
    );

    // Send response
    response.status(errorDetails.statusCode).json(errorResponse);
  }

  /**
   * Extract error details from exception
   */
  private extractErrorDetails(exception: unknown): {
    statusCode: number;
    message: string;
    errorCode?: string;
    stack?: string;
    isOperational: boolean;
    details?: Record<string, unknown>;
  } {
    // BaseException (custom exceptions)
    if (exception instanceof BaseException) {
      return {
        statusCode: exception.getStatus(),
        message: this.isProduction
          ? exception.getProductionMessage()
          : exception.message,
        errorCode: exception.errorCode,
        stack: this.isDevelopment ? exception.stack : undefined,
        isOperational: exception.isOperationalError(),
        details: this.isDevelopment ? exception.details : undefined,
      };
    }

    // HttpException (NestJS built-in)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return {
        statusCode: status,
        message: this.isProduction
          ? this.getGenericMessage(status)
          : typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as { message: string }).message ||
              exception.message,
        stack: this.isDevelopment ? exception.stack : undefined,
        isOperational: true,
        details:
          this.isDevelopment && typeof exceptionResponse === 'object'
            ? (exceptionResponse as Record<string, unknown>)
            : undefined,
      };
    }

    // Error (JavaScript Error)
    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: this.isProduction
          ? 'An internal error occurred. Please try again later'
          : exception.message,
        stack: this.isDevelopment ? exception.stack : undefined,
        isOperational: false,
      };
    }

    // Unknown exception
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: this.isProduction
        ? 'An unexpected error occurred'
        : String(exception),
      isOperational: false,
    };
  }

  /**
   * Get generic error message for production
   */
  private getGenericMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Bad request',
      401: 'Authentication required',
      403: 'Access forbidden',
      404: 'Resource not found',
      409: 'Conflict detected',
      422: 'Unprocessable entity',
      429: 'Too many requests',
      500: 'Internal server error',
      502: 'Bad gateway',
      503: 'Service unavailable',
      504: 'Gateway timeout',
    };

    return messages[statusCode] || 'An error occurred';
  }

  /**
   * Log error with appropriate level and context
   */
  private logError(
    exception: unknown,
    errorDetails: {
      statusCode: number;
      message: string;
      errorCode?: string;
      stack?: string;
      isOperational: boolean;
    },
    request: Request,
    correlationId: string,
  ): void {
    const { statusCode, message, errorCode, stack, isOperational } =
      errorDetails;
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const userId = (request.user as { sub?: string })?.sub;

    const logMeta = {
      correlationId,
      errorCode,
      statusCode,
      method,
      url,
      ip,
      userAgent,
      userId,
      isOperational,
      type: 'exception',
    };

    // Determine log level
    if (statusCode >= 500) {
      this.logger.error(message, stack, 'GlobalExceptionFilter', logMeta);
    } else if (statusCode >= 400) {
      this.logger.warn(message, 'GlobalExceptionFilter', logMeta);
    } else {
      this.logger.log(message, 'GlobalExceptionFilter', logMeta);
    }

    // Log full exception for non-operational errors
    if (!isOperational) {
      this.logger.error(
        'Non-operational error detected',
        stack || String(exception),
        'GlobalExceptionFilter',
        {
          ...logMeta,
          exceptionType: exception?.constructor?.name,
        },
      );
    }
  }

  /**
   * Send error to Sentry
   */
  private sendToSentry(
    exception: unknown,
    request: Request,
    correlationId: string,
  ): void {
    try {
      Sentry.withScope((scope) => {
        scope.setTag('correlation_id', correlationId);
        scope.setTag('path', request.url);
        scope.setTag('method', request.method);

        scope.setUser({
          id: (request.user as { sub?: string })?.sub,
          ip_address: request.ip,
        });

        scope.setContext('request', {
          url: request.url,
          method: request.method,
          headers: this.sanitizeHeaders(request.headers),
          query: request.query,
        });

        if (exception instanceof Error) {
          Sentry.captureException(exception);
        } else {
          Sentry.captureMessage(String(exception), 'error');
        }
      });
    } catch (sentryError) {
      this.logger.error(
        'Failed to send error to Sentry',
        String(sentryError),
        'GlobalExceptionFilter',
      );
    }
  }

  /**
   * Sanitize headers to remove sensitive data
   */
  private sanitizeHeaders(
    headers: Record<string, unknown>,
  ): Record<string, unknown> {
    const sensitiveKeys = [
      'authorization',
      'cookie',
      'x-api-key',
      'x-access-token',
    ];
    const sanitized = { ...headers };

    sensitiveKeys.forEach((key) => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  /**
   * Build error response object
   */
  private buildErrorResponse(
    errorDetails: {
      statusCode: number;
      message: string;
      errorCode?: string;
      stack?: string;
      details?: Record<string, unknown>;
    },
    path: string,
    method: string,
    timestamp: string,
    correlationId: string,
  ): Record<string, unknown> {
    const baseResponse = {
      status: 'error',
      statusCode: errorDetails.statusCode,
      message: errorDetails.message,
      timestamp,
      path,
      method,
      correlationId,
    };

    // Add error code if available
    if (errorDetails.errorCode) {
      Object.assign(baseResponse, { errorCode: errorDetails.errorCode });
    }

    // Add details in development
    if (this.isDevelopment && errorDetails.details) {
      Object.assign(baseResponse, { details: errorDetails.details });
    }

    // Add stack trace in development
    if (this.isDevelopment && errorDetails.stack) {
      Object.assign(baseResponse, { stack: errorDetails.stack });
    }

    return baseResponse;
  }
}
