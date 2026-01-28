/**
 * API response utility functions
 * Helper functions for creating standardized API responses
 */

import { ApiErrorResponse } from '@/types';
import { ApiStatus } from '@/enums';

/**
 * Creates a standardized API error response
 *
 * @param statusCode - HTTP status code
 * @param message - Error message
 * @param timestamp - ISO timestamp string
 * @param path - Request path
 * @param errors - Optional validation errors
 * @returns Formatted ApiErrorResponse
 *
 * @example
 * ```typescript
 * const errorResponse = makeApiErrorResponse(
 *   400,
 *   'Validation failed',
 *   new Date().toISOString(),
 *   '/api/users',
 *   ['Email is required']
 * );
 * ```
 */
export function makeApiErrorResponse(
  statusCode: number,
  message: string,
  timestamp: string,
  path: string,
  errors?: Record<string, string> | string[] | null
): ApiErrorResponse {
  return {
    status: ApiStatus.ERROR,
    statusCode,
    message,
    errors: errors || null,
    data: null,
    meta: null,
    timestamp,
    path,
  };
}

/**
 * Type guard to check if response is successful
 *
 * @param response - API response to check
 * @returns True if response is ApiSuccessResponse
 *
 * @example
 * ```typescript
 * const response = await apiClient.get('/users');
 * if (isSuccessResponse(response)) {
 *   console.log(response.data); // TypeScript knows this is success
 * }
 * ```
 */
export function isSuccessResponse<T>(
  response: unknown
): response is { status: 'success'; data: T } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    response.status === 'success'
  );
}

/**
 * Type guard to check if response is an error
 *
 * @param response - API response to check
 * @returns True if response is ApiErrorResponse
 *
 * @example
 * ```typescript
 * const response = await apiClient.get('/users');
 * if (isErrorResponse(response)) {
 *   console.error(response.message); // TypeScript knows this is error
 * }
 * ```
 */
export function isErrorResponse(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'status' in response &&
    response.status === 'error'
  );
}
