import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { createHash } from 'crypto';

/**
 * HTTP Cache Interceptor
 * Adds ETag, Last-Modified, and Cache-Control headers
 * Handles 304 Not Modified responses
 */
@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpCacheInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip caching for non-GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        // Generate ETag from response data
        const etag = this.generateETag(data);

        // Get If-None-Match header from request
        const ifNoneMatch = request.headers['if-none-match'];

        // Check if ETag matches
        if (ifNoneMatch === etag) {
          this.logger.debug(`ETag match for ${request.url} - returning 304`);
          response.status(304).end();
          return;
        }

        // Set cache headers
        this.setCacheHeaders(response, etag);

        this.logger.debug(
          `HTTP cache headers set for ${request.method} ${request.url}`,
        );
      }),
    );
  }

  /**
   * Generate ETag from response data
   *
   * @param data - Response data
   * @returns ETag value
   */
  private generateETag(data: unknown): string {
    const hash = createHash('md5');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  }

  /**
   * Set cache headers on response
   *
   * @param response - Express response
   * @param etag - ETag value
   */
  private setCacheHeaders(response: Response, etag: string): void {
    // Set ETag
    response.setHeader('ETag', etag);

    // Set Last-Modified (current time for now)
    const lastModified = new Date().toUTCString();
    response.setHeader('Last-Modified', lastModified);

    // Set Cache-Control
    // max-age=60: Cache for 60 seconds
    // must-revalidate: Must check with server after expiry
    response.setHeader('Cache-Control', 'max-age=60, must-revalidate');

    // Set Vary header to include Accept-Encoding
    response.setHeader('Vary', 'Accept-Encoding');
  }
}

/**
 * Custom HTTP Cache Interceptor with configurable options
 */
@Injectable()
export class ConfigurableHttpCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ConfigurableHttpCacheInterceptor.name);

  constructor(
    private readonly maxAge: number = 60, // seconds
    private readonly isPrivate: boolean = false,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip caching for non-GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        // Generate ETag
        const etag = this.generateETag(data);

        // Check If-None-Match
        const ifNoneMatch = request.headers['if-none-match'];
        if (ifNoneMatch === etag) {
          response.status(304).end();
          return;
        }

        // Check If-Modified-Since
        const ifModifiedSince = request.headers['if-modified-since'];
        const lastModified = new Date();

        if (ifModifiedSince) {
          const ifModifiedSinceDate = new Date(ifModifiedSince);
          if (lastModified <= ifModifiedSinceDate) {
            response.status(304).end();
            return;
          }
        }

        // Set cache headers
        response.setHeader('ETag', etag);
        response.setHeader('Last-Modified', lastModified.toUTCString());

        // Build Cache-Control directive
        const cacheControl = this.buildCacheControl();
        response.setHeader('Cache-Control', cacheControl);

        // Set Vary header
        response.setHeader('Vary', 'Accept-Encoding, Authorization');

        this.logger.debug(
          `Configurable cache headers set: ${request.url} (max-age=${this.maxAge})`,
        );
      }),
    );
  }

  /**
   * Generate ETag from response data
   */
  private generateETag(data: unknown): string {
    const hash = createHash('md5');
    hash.update(JSON.stringify(data));
    return `"${hash.digest('hex')}"`;
  }

  /**
   * Build Cache-Control header value
   */
  private buildCacheControl(): string {
    const directives: string[] = [];

    if (this.isPrivate) {
      directives.push('private');
    } else {
      directives.push('public');
    }

    directives.push(`max-age=${this.maxAge}`);
    directives.push('must-revalidate');

    return directives.join(', ');
  }
}
