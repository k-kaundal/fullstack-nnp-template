import { HttpStatus } from '@nestjs/common';

/**
 * Configuration options for API responses
 * Used by ApiResponse utility class to build standardized responses
 *
 * @template T - Type of the response data
 */
export interface ApiResponseOptions<T> {
  /** HTTP status code for the response */
  statusCode?: HttpStatus;

  /** Human-readable message describing the response */
  message?: string;

  /** Response payload data (for success responses) */
  data?: T;

  /** Error details (for error responses) */
  errors?: unknown;

  /** Additional metadata to include in response */
  meta?: Record<string, unknown>;

  /** Request path (auto-populated if not provided) */
  path?: string;
}

/**
 * Metadata for paginated responses
 * Provides information about the current page and total results
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;

  /** Number of items per page */
  limit: number;

  /** Total number of items across all pages */
  total: number;

  /** Total number of pages */
  totalPages: number;
}
