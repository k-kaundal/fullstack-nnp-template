/**
 * Custom Throttler Guard
 * Extends NestJS ThrottlerGuard with custom headers and user-based limiting
 */

import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';

/**
 * Enhanced throttler guard with rate limit headers
 * Adds X-RateLimit-* headers to all responses
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  /**
   * Override canActivate to add custom headers
   *
   * @param context - Execution context
   * @returns Boolean indicating if request is allowed
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      const result = await super.canActivate(context);

      // Add rate limit headers to response
      this.addRateLimitHeaders(response, request);

      return result;
    } catch (error) {
      // Log rate limit violation
      const key = this.getRateLimitKey(request);
      this.logger.warn(
        `Rate limit exceeded for ${key} on ${request.method} ${request.url}`,
      );

      // Add rate limit headers even on error
      this.addRateLimitHeaders(response, request, true);

      throw error;
    }
  }

  /**
   * Generate tracking key for rate limiting
   * Uses user ID if authenticated, otherwise falls back to IP
   *
   * @param req - Request object
   * @returns Tracking key
   */
  protected async getTracker(req: Request): Promise<string> {
    return this.getRateLimitKey(req);
  }

  /**
   * Get rate limit key based on user authentication
   * Uses user ID if authenticated, otherwise falls back to IP
   *
   * @param request - Express request object
   * @returns Rate limit key (user ID or IP)
   */
  protected getRateLimitKey(request: Request): string {
    // Check if user is authenticated
    const user = (request as unknown as { user?: { sub?: string } }).user;

    if (user?.sub) {
      return `user:${user.sub}`;
    }

    // Fall back to IP-based rate limiting
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.socket.remoteAddress ||
      'unknown';

    return `ip:${Array.isArray(ip) ? ip[0] : ip}`;
  }

  /**
   * Add rate limit headers to response
   * Follows standard rate limit header conventions
   *
   * @param response - Express response object
   * @param request - Express request object
   * @param exceeded - Whether rate limit was exceeded
   */
  protected addRateLimitHeaders(
    response: Response,
    request: Request,
    exceeded = false,
  ): void {
    // Get actual rate limit values from environment
    const isDevelopment = process.env.NODE_ENV === 'development';
    const limit = parseInt(
      process.env.RATE_LIMIT_DEFAULT_MAX || (isDevelopment ? '2000' : '100'),
      10,
    );
    const ttl = parseInt(
      process.env.RATE_LIMIT_DEFAULT_TTL ||
        (isDevelopment ? '300000' : '60000'),
      10,
    );

    // Calculate reset time
    const resetTime = Math.ceil(Date.now() / 1000) + Math.ceil(ttl / 1000);

    // Standard rate limit headers (RFC 6585)
    response.setHeader('X-RateLimit-Limit', limit.toString());
    response.setHeader('X-RateLimit-Remaining', exceeded ? '0' : '1');
    response.setHeader('X-RateLimit-Reset', resetTime.toString());

    // Additional custom headers
    response.setHeader('X-RateLimit-Policy', `${limit};w=${ttl / 1000}`);

    if (exceeded) {
      response.setHeader('Retry-After', Math.ceil(ttl / 1000).toString());
    }

    // Log rate limit info (debug only)
    if (isDevelopment) {
      const key = this.getRateLimitKey(request);
      this.logger.debug(
        `Rate limit: ${key} - Limit: ${limit}, TTL: ${ttl}ms, Reset: ${resetTime}`,
      );
    }
  }
}
