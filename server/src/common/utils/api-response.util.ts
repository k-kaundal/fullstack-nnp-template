import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '../interfaces/api-response.interface';
import {
  SuccessResponseBody,
  ErrorResponseBody,
} from '../types/response.types';

/**
 * Utility class for standardized API responses
 * Provides static methods for creating consistent success and error responses
 */
export class ApiResponse {
  /**
   * Creates a standardized success response
   *
   * @param res - Express response object
   * @param options - Response configuration options
   * @returns Response - HTTP response with success format
   *
   * @example
   * ```typescript
   * return ApiResponse.success(res, {
   *   statusCode: HttpStatus.OK,
   *   data: users,
   *   message: 'Users fetched successfully',
   *   meta: { total: users.length }
   * });
   * ```
   */
  static success<T>(
    res: Response,
    options: ApiResponseOptions<T> = {},
  ): Response {
    const {
      statusCode = HttpStatus.OK,
      message = 'Request successful',
      data = null,
      meta = null,
      path,
    } = options;

    // Build standardized success response body
    const responseBody: SuccessResponseBody<T> = {
      status: 'success',
      statusCode: statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
      path: path || res.req?.url || '',
    };

    // Include metadata if provided
    if (meta) {
      responseBody.meta = meta;
    }

    return res.status(statusCode).send(responseBody);
  }

  /**
   * Creates a standardized error response
   *
   * @param res - Express response object
   * @param options - Error response configuration options
   * @returns Response - HTTP response with error format
   *
   * @example
   * ```typescript
   * return ApiResponse.error(res, {
   *   statusCode: HttpStatus.NOT_FOUND,
   *   message: 'User not found',
   *   errors: validationErrors
   * });
   * ```
   */
  static error<T>(
    res: Response,
    options: ApiResponseOptions<T> = {},
  ): Response {
    const {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR,
      message = 'Something went wrong',
      errors = null,
      meta = null,
      path,
    } = options;

    // Build standardized error response body
    const responseBody: ErrorResponseBody = {
      status: 'error',
      statusCode: statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: path || res.req?.url || '',
    };

    // Include metadata if provided
    if (meta) {
      responseBody.meta = meta;
    }

    return res.status(statusCode).send(responseBody);
  }
}
