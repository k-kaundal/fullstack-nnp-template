/**
 * Common Swagger API Response Decorators
 * Provides reusable response documentation for standard HTTP status codes
 */

import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse as ApiResponseDecorator } from '@nestjs/swagger';

/**
 * 401 Unauthorized Response Decorator
 * Use for all protected endpoints requiring JWT authentication
 *
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 *
 * @example
 * ```typescript
 * @ApiUnauthorizedResponse('/api/v1/users')
 * @UseGuards(JwtAuthGuard)
 * @Get()
 * findAll() { ... }
 * ```
 */
export function ApiUnauthorizedResponse(path: string = '/api/v1') {
  return applyDecorators(
    ApiResponseDecorator({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized - Invalid or missing JWT token.',
      schema: {
        example: {
          status: 'error',
          statusCode: 401,
          message: 'Unauthorized',
          timestamp: '2026-01-31T19:20:00.000Z',
          path,
        },
      },
    }),
  );
}

/**
 * 403 Forbidden Response Decorator
 * Use for endpoints requiring specific permissions
 *
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 */
export function ApiForbiddenResponse(path: string = '/api/v1') {
  return applyDecorators(
    ApiResponseDecorator({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden - Insufficient permissions.',
      schema: {
        example: {
          status: 'error',
          statusCode: 403,
          message: 'Forbidden resource',
          timestamp: '2026-01-31T19:20:00.000Z',
          path,
        },
      },
    }),
  );
}

/**
 * 404 Not Found Response Decorator
 * Use for GET, PATCH, DELETE endpoints with ID parameter
 *
 * @param resourceName - Name of the resource (e.g., 'User', 'Post')
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 */
export function ApiNotFoundResponse(
  resourceName: string = 'Resource',
  path: string = '/api/v1',
) {
  return applyDecorators(
    ApiResponseDecorator({
      status: HttpStatus.NOT_FOUND,
      description: `Not Found - ${resourceName} not found.`,
      schema: {
        example: {
          status: 'error',
          statusCode: 404,
          message: `${resourceName} not found`,
          timestamp: '2026-01-31T19:20:00.000Z',
          path,
        },
      },
    }),
  );
}

/**
 * 400 Bad Request Response Decorator
 * Use for endpoints with validation
 *
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 */
export function ApiBadRequestResponse(path: string = '/api/v1') {
  return applyDecorators(
    ApiResponseDecorator({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request - Validation failed.',
      schema: {
        example: {
          status: 'error',
          statusCode: 400,
          message: 'Validation failed',
          errors: ['Field is required', 'Invalid format'],
          timestamp: '2026-01-31T19:20:00.000Z',
          path,
        },
      },
    }),
  );
}

/**
 * 409 Conflict Response Decorator
 * Use for POST/PATCH endpoints where duplicate resource may exist
 *
 * @param message - Conflict message
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 */
export function ApiConflictResponse(
  message: string = 'Resource already exists',
  path: string = '/api/v1',
) {
  return applyDecorators(
    ApiResponseDecorator({
      status: HttpStatus.CONFLICT,
      description: 'Conflict - Resource already exists.',
      schema: {
        example: {
          status: 'error',
          statusCode: 409,
          message,
          timestamp: '2026-01-31T19:20:00.000Z',
          path,
        },
      },
    }),
  );
}

/**
 * 500 Internal Server Error Response Decorator
 * Use as fallback for unexpected errors
 *
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 */
export function ApiInternalServerErrorResponse(path: string = '/api/v1') {
  return applyDecorators(
    ApiResponseDecorator({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal Server Error - Unexpected error occurred.',
      schema: {
        example: {
          status: 'error',
          statusCode: 500,
          message: 'Internal server error',
          timestamp: '2026-01-31T19:20:00.000Z',
          path,
        },
      },
    }),
  );
}

/**
 * Combined Standard Protected Endpoint Responses
 * Includes: 401 Unauthorized, 403 Forbidden, 500 Internal Server Error
 *
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 *
 * @example
 * ```typescript
 * @ApiStandardProtectedResponses('/api/v1/users')
 * @UseGuards(JwtAuthGuard)
 * @Get()
 * findAll() { ... }
 * ```
 */
export function ApiStandardProtectedResponses(path: string = '/api/v1') {
  return applyDecorators(
    ApiUnauthorizedResponse(path),
    ApiForbiddenResponse(path),
    ApiInternalServerErrorResponse(path),
  );
}

/**
 * Combined Standard CRUD Responses for GET by ID, PATCH, DELETE
 * Includes: 401, 404, 500
 *
 * @param resourceName - Name of the resource (e.g., 'User')
 * @param path - API endpoint path for example (optional)
 * @returns Combined decorators
 */
export function ApiStandardCrudResponses(
  resourceName: string = 'Resource',
  path: string = '/api/v1',
) {
  return applyDecorators(
    ApiUnauthorizedResponse(path),
    ApiNotFoundResponse(resourceName, path),
    ApiInternalServerErrorResponse(path),
  );
}
