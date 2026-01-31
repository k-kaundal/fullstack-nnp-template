/**
 * Sanitization Middleware
 * Sanitizes request data to prevent XSS and SQL injection
 */

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  /**
   * Sanitize request body, query params, and URL params
   */
  use(req: Request, _res: Response, next: NextFunction): void {
    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body) as Record<string, unknown>;
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query) as typeof req.query;
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = this.sanitizeObject(req.params) as typeof req.params;
    }

    next();
  }

  /**
   * Recursively sanitize object
   * @param obj - Object to sanitize
   * @returns Sanitized object
   */
  private sanitizeObject(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map((item) =>
            typeof item === 'string'
              ? this.sanitizeString(item)
              : typeof item === 'object' && item !== null
                ? this.sanitizeObject(item as Record<string, unknown>)
                : item,
          );
        } else if (typeof value === 'object' && value !== null) {
          sanitized[key] = this.sanitizeObject(
            value as Record<string, unknown>,
          );
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Sanitize string to prevent XSS and SQL injection
   * @param value - String to sanitize
   * @returns Sanitized string
   */
  private sanitizeString(value: string): string {
    // Remove HTML tags
    let sanitized = value.replace(/<[^>]*>/g, '');

    // Escape special characters
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Remove SQL injection patterns
    sanitized = sanitized.replace(
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      '',
    );

    // Remove script tags
    sanitized = sanitized.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      '',
    );

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove onerror, onclick, etc.
    sanitized = sanitized.replace(/\bon\w+\s*=/gi, '');

    return sanitized.trim();
  }
}
