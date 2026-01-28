/**
 * Success response body type for standardized API responses
 * Used when requests are processed successfully
 *
 * @template T - Type of the data payload
 *
 * @example
 * ```typescript
 * const response: SuccessResponseBody<User> = {
 *   status: 'success',
 *   statusCode: 200,
 *   message: 'User fetched successfully',
 *   data: user,
 *   timestamp: '2024-01-27T10:30:00.000Z',
 *   path: '/api/users/123'
 * };
 * ```
 */
export type SuccessResponseBody<T> = {
  /** Response status indicator (always 'success' for successful responses) */
  status: 'success';

  /** HTTP status code (200, 201, etc.) */
  statusCode: number;

  /** Human-readable success message */
  message: string;

  /** Response payload data (can be null for operations like delete) */
  data: T | null;

  /** ISO 8601 timestamp when response was generated */
  timestamp: string;

  /** Request path that generated this response */
  path: string;

  /** Optional metadata (pagination info, counts, etc.) */
  meta?: Record<string, unknown>;
};

/**
 * Error response body type for standardized API error responses
 * Used when requests fail due to client or server errors
 *
 * @example
 * ```typescript
 * const response: ErrorResponseBody = {
 *   status: 'error',
 *   statusCode: 404,
 *   message: 'User not found',
 *   errors: null,
 *   timestamp: '2024-01-27T10:30:00.000Z',
 *   path: '/api/users/123'
 * };
 * ```
 */
export type ErrorResponseBody = {
  /** Response status indicator (always 'error' for error responses) */
  status: 'error';

  /** HTTP error status code (400, 404, 500, etc.) */
  statusCode: number;

  /** Human-readable error message */
  message: string;

  /** Detailed error information (validation errors, stack traces, etc.) */
  errors: unknown;

  /** ISO 8601 timestamp when error occurred */
  timestamp: string;

  /** Request path where error occurred */
  path: string;

  /** Optional metadata for debugging */
  meta?: Record<string, unknown>;
};

/**
 * HTTP exception response type from NestJS HttpException
 * Used internally by exception filters to extract error details
 */
export type HttpExceptionResponse = {
  /** Error message (can be string or array of validation errors) */
  message: string | string[];

  /** Error type/name (e.g., 'Bad Request', 'Not Found') */
  error?: string;

  /** HTTP status code */
  statusCode?: number;
};
