/**
 * API Examples Decorators
 * Comprehensive request/response examples for Swagger documentation
 */

import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

/**
 * Standard success response with example
 */
export function ApiSuccessResponse(
  statusCode: HttpStatus,
  description: string,
  dataExample: unknown,
  metaExample?: Record<string, unknown>,
) {
  return ApiResponse({
    status: statusCode,
    description,
    schema: {
      example: {
        status: 'success',
        statusCode,
        message: description,
        data: dataExample,
        ...(metaExample && { meta: metaExample }),
        timestamp: '2026-01-31T20:00:00.000Z',
        path: '/api/v1/endpoint',
      },
    },
  });
}

/**
 * Standard error response with example
 */
export function ApiErrorResponse(
  statusCode: HttpStatus,
  description: string,
  message: string,
  errors?: string[],
) {
  return ApiResponse({
    status: statusCode,
    description,
    schema: {
      example: {
        status: 'error',
        statusCode,
        message,
        ...(errors && { errors }),
        timestamp: '2026-01-31T20:00:00.000Z',
        path: '/api/v1/endpoint',
      },
    },
  });
}

/**
 * Complete CRUD response examples for a resource
 */
export function ApiCrudExamples(resourceName: string, example: unknown) {
  return applyDecorators(
    ApiSuccessResponse(
      HttpStatus.OK,
      `${resourceName} retrieved successfully`,
      example,
    ),
    ApiSuccessResponse(
      HttpStatus.CREATED,
      `${resourceName} created successfully`,
      example,
      {
        resource_id: 'uuid',
        created_at: '2026-01-31T20:00:00.000Z',
      },
    ),
    ApiErrorResponse(
      HttpStatus.BAD_REQUEST,
      'Validation failed',
      'Validation failed',
      ['Email is required', 'Password must be at least 8 characters'],
    ),
    ApiErrorResponse(
      HttpStatus.NOT_FOUND,
      `${resourceName} not found`,
      `${resourceName} not found`,
    ),
    ApiErrorResponse(
      HttpStatus.CONFLICT,
      `${resourceName} already exists`,
      `${resourceName} with this identifier already exists`,
    ),
  );
}

/**
 * Authentication response examples
 */
export function ApiAuthExamples() {
  return applyDecorators(
    ApiSuccessResponse(
      HttpStatus.OK,
      'Login successful',
      {
        user: {
          id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: '2026-01-31T10:23:22.983Z',
          updatedAt: '2026-01-31T10:23:22.983Z',
        },
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          expiresIn: 900,
        },
      },
      {
        user_id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
        session_id: 'session-uuid',
        device_info: 'Chrome on MacOS',
        ip_address: '192.168.1.1',
        logged_in_at: '2026-01-31T20:00:00.000Z',
      },
    ),
    ApiErrorResponse(
      HttpStatus.UNAUTHORIZED,
      'Invalid credentials',
      'Invalid email or password',
    ),
    ApiErrorResponse(
      HttpStatus.FORBIDDEN,
      'Account inactive',
      'Your account has been deactivated',
    ),
  );
}

/**
 * Pagination response examples
 */
export function ApiPaginationExamples(itemExample: unknown) {
  return ApiSuccessResponse(
    HttpStatus.OK,
    'Resources retrieved successfully',
    [itemExample, itemExample],
    {
      total: 25,
      count: 10,
      page: 2,
      limit: 10,
      total_pages: 3,
      has_next: true,
      has_previous: true,
    },
  );
}
