import { HttpStatus } from '@nestjs/common';

/**
 * Base custom exception class for handling application errors
 * Provides consistent error structure with HTTP status codes and operational flags
 */
export class CustomException extends Error {
  /** HTTP status code associated with the exception */
  public readonly statusCode: HttpStatus;

  /** Indicates if error is operational (expected) or programming error */
  public readonly isOperational: boolean;

  /**
   * Creates a new CustomException instance
   *
   * @param message - Error message describing what went wrong
   * @param statusCode - HTTP status code for the error (default: 500)
   * @param isOperational - Whether error is operational/expected (default: true)
   */
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, CustomException.prototype);
  }
}

/**
 * Exception for resource not found errors (HTTP 404)
 * Used when a requested resource doesn't exist in the database
 */
export class NotFoundException extends CustomException {
  /**
   * Creates a NotFoundException with 404 status code
   * @param message - Error message (default: 'Resource not found')
   */
  constructor(message: string = 'Resource not found') {
    super(message, HttpStatus.NOT_FOUND);
  }
}

/**
 * Exception for conflict errors (HTTP 409)
 * Used when a resource already exists (e.g., duplicate email)
 */
export class ConflictException extends CustomException {
  /**
   * Creates a ConflictException with 409 status code
   * @param message - Error message (default: 'Resource already exists')
   */
  constructor(message: string = 'Resource already exists') {
    super(message, HttpStatus.CONFLICT);
  }
}

/**
 * Exception for bad request errors (HTTP 400)
 * Used when client sends invalid data or malformed requests
 */
export class BadRequestException extends CustomException {
  /**
   * Creates a BadRequestException with 400 status code
   * @param message - Error message (default: 'Bad request')
   */
  constructor(message: string = 'Bad request') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

/**
 * Exception for unauthorized errors (HTTP 401)
 * Used when authentication is required but not provided or invalid
 */
export class UnauthorizedException extends CustomException {
  /**
   * Creates an UnauthorizedException with 401 status code
   * @param message - Error message (default: 'Unauthorized')
   */
  constructor(message: string = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

/**
 * Exception for forbidden errors (HTTP 403)
 * Used when user is authenticated but lacks permission to access resource
 */
export class ForbiddenException extends CustomException {
  /**
   * Creates a ForbiddenException with 403 status code
   * @param message - Error message (default: 'Forbidden')
   */
  constructor(message: string = 'Forbidden') {
    super(message, HttpStatus.FORBIDDEN);
  }
}

/**
 * Exception for internal server errors (HTTP 500)
 * Used when an unexpected server error occurs
 */
export class InternalServerException extends CustomException {
  /**
   * Creates an InternalServerException with 500 status code
   * @param message - Error message (default: 'Internal server error')
   */
  constructor(message: string = 'Internal server error') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
