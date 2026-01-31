import { HttpException } from '@nestjs/common';
import {
  ErrorCode,
  ErrorCodeToHttpStatus,
  ErrorCodeToProductionMessage,
} from '../enums/error-codes.enum';

/**
 * Base exception class for all custom exceptions
 * Provides consistent error structure and metadata
 */
export class BaseException extends HttpException {
  public readonly errorCode: ErrorCode;
  public readonly timestamp: string;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    errorCode: ErrorCode,
    statusCode?: number,
    details?: Record<string, unknown>,
    isOperational = true,
  ) {
    super(
      {
        message,
        errorCode,
        statusCode: statusCode || ErrorCodeToHttpStatus[errorCode],
        timestamp: new Date().toISOString(),
        details,
      },
      statusCode || ErrorCodeToHttpStatus[errorCode],
    );

    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Get user-friendly message for production
   */
  getProductionMessage(): string {
    return ErrorCodeToProductionMessage[this.errorCode] || 'An error occurred';
  }

  /**
   * Check if error is safe to expose to client
   */
  isOperationalError(): boolean {
    return this.isOperational;
  }
}

// ==========================================
// Authentication & Authorization Exceptions
// ==========================================

/**
 * Thrown when authentication credentials are invalid
 */
export class InvalidCredentialsException extends BaseException {
  constructor(
    message = 'Invalid credentials',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.AUTH_INVALID_CREDENTIALS, undefined, details);
  }
}

/**
 * Thrown when authentication token has expired
 */
export class TokenExpiredException extends BaseException {
  constructor(
    message = 'Token has expired',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.AUTH_TOKEN_EXPIRED, undefined, details);
  }
}

/**
 * Thrown when authentication token is invalid
 */
export class InvalidTokenException extends BaseException {
  constructor(message = 'Invalid token', details?: Record<string, unknown>) {
    super(message, ErrorCode.AUTH_TOKEN_INVALID, undefined, details);
  }
}

/**
 * Thrown when authentication token is missing
 */
export class MissingTokenException extends BaseException {
  constructor(
    message = 'Authentication token is required',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.AUTH_TOKEN_MISSING, undefined, details);
  }
}

/**
 * Thrown when user is not authorized
 */
export class UnauthorizedException extends BaseException {
  constructor(
    message = 'Unauthorized access',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.AUTH_UNAUTHORIZED, undefined, details);
  }
}

/**
 * Thrown when user access is forbidden
 */
export class ForbiddenException extends BaseException {
  constructor(message = 'Access forbidden', details?: Record<string, unknown>) {
    super(message, ErrorCode.AUTH_FORBIDDEN, undefined, details);
  }
}

/**
 * Thrown when email is not verified
 */
export class EmailNotVerifiedException extends BaseException {
  constructor(
    message = 'Email not verified',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.AUTH_EMAIL_NOT_VERIFIED, undefined, details);
  }
}

/**
 * Thrown when account is disabled
 */
export class AccountDisabledException extends BaseException {
  constructor(
    message = 'Account is disabled',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.AUTH_ACCOUNT_DISABLED, undefined, details);
  }
}

/**
 * Thrown when session has expired
 */
export class SessionExpiredException extends BaseException {
  constructor(
    message = 'Session has expired',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.AUTH_SESSION_EXPIRED, undefined, details);
  }
}

/**
 * Thrown when session is invalid
 */
export class InvalidSessionException extends BaseException {
  constructor(message = 'Invalid session', details?: Record<string, unknown>) {
    super(message, ErrorCode.AUTH_SESSION_INVALID, undefined, details);
  }
}

// ==========================================
// Validation Exceptions
// ==========================================

/**
 * Thrown when validation fails
 */
export class ValidationException extends BaseException {
  constructor(
    message = 'Validation failed',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.VALIDATION_FAILED, undefined, details);
  }
}

/**
 * Thrown when email format is invalid
 */
export class InvalidEmailException extends BaseException {
  constructor(
    message = 'Invalid email format',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.VALIDATION_EMAIL_INVALID, undefined, details);
  }
}

/**
 * Thrown when password is weak
 */
export class WeakPasswordException extends BaseException {
  constructor(
    message = 'Password does not meet requirements',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.VALIDATION_PASSWORD_WEAK, undefined, details);
  }
}

/**
 * Thrown when required field is missing
 */
export class RequiredFieldMissingException extends BaseException {
  constructor(field: string, details?: Record<string, unknown>) {
    super(
      `Required field '${field}' is missing`,
      ErrorCode.VALIDATION_REQUIRED_FIELD_MISSING,
      undefined,
      {
        field,
        ...details,
      },
    );
  }
}

/**
 * Thrown when UUID format is invalid
 */
export class InvalidUUIDException extends BaseException {
  constructor(
    message = 'Invalid UUID format',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.VALIDATION_INVALID_UUID, undefined, details);
  }
}

// ==========================================
// Database Exceptions
// ==========================================

/**
 * Thrown when database connection fails
 */
export class DatabaseConnectionException extends BaseException {
  constructor(
    message = 'Database connection failed',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.DATABASE_CONNECTION_FAILED, undefined, details);
  }
}

/**
 * Thrown when database query fails
 */
export class DatabaseQueryException extends BaseException {
  constructor(
    message = 'Database query failed',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.DATABASE_QUERY_FAILED, undefined, details);
  }
}

/**
 * Thrown when database transaction fails
 */
export class DatabaseTransactionException extends BaseException {
  constructor(
    message = 'Database transaction failed',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.DATABASE_TRANSACTION_FAILED, undefined, details);
  }
}

/**
 * Thrown when duplicate entry is detected
 */
export class DuplicateEntryException extends BaseException {
  constructor(
    resource: string,
    field?: string,
    details?: Record<string, unknown>,
  ) {
    const message = field
      ? `${resource} with this ${field} already exists`
      : `${resource} already exists`;
    super(message, ErrorCode.DATABASE_DUPLICATE_ENTRY, undefined, {
      resource,
      field,
      ...details,
    });
  }
}

/**
 * Thrown when foreign key constraint is violated
 */
export class ForeignKeyViolationException extends BaseException {
  constructor(
    message = 'Foreign key constraint violated',
    details?: Record<string, unknown>,
  ) {
    super(
      message,
      ErrorCode.DATABASE_FOREIGN_KEY_VIOLATION,
      undefined,
      details,
    );
  }
}

/**
 * Thrown when database operation times out
 */
export class DatabaseTimeoutException extends BaseException {
  constructor(
    message = 'Database operation timed out',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.DATABASE_TIMEOUT, undefined, details);
  }
}

// ==========================================
// Resource Exceptions
// ==========================================

/**
 * Thrown when resource is not found
 */
export class ResourceNotFoundException extends BaseException {
  constructor(
    resource: string,
    identifier?: string,
    details?: Record<string, unknown>,
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, ErrorCode.RESOURCE_NOT_FOUND, undefined, {
      resource,
      identifier,
      ...details,
    });
  }
}

/**
 * Thrown when resource already exists
 */
export class ResourceAlreadyExistsException extends BaseException {
  constructor(
    resource: string,
    identifier?: string,
    details?: Record<string, unknown>,
  ) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' already exists`
      : `${resource} already exists`;
    super(message, ErrorCode.RESOURCE_ALREADY_EXISTS, undefined, {
      resource,
      identifier,
      ...details,
    });
  }
}

/**
 * Thrown when resource conflict is detected
 */
export class ResourceConflictException extends BaseException {
  constructor(
    message = 'Resource conflict detected',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.RESOURCE_CONFLICT, undefined, details);
  }
}

/**
 * Thrown when resource is locked
 */
export class ResourceLockedException extends BaseException {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(
      `${resource} is currently locked`,
      ErrorCode.RESOURCE_LOCKED,
      undefined,
      {
        resource,
        ...details,
      },
    );
  }
}

/**
 * Thrown when resource is unavailable
 */
export class ResourceUnavailableException extends BaseException {
  constructor(resource: string, details?: Record<string, unknown>) {
    super(
      `${resource} is temporarily unavailable`,
      ErrorCode.RESOURCE_UNAVAILABLE,
      undefined,
      {
        resource,
        ...details,
      },
    );
  }
}

// ==========================================
// Business Logic Exceptions
// ==========================================

/**
 * Thrown when business rule is violated
 */
export class BusinessRuleViolationException extends BaseException {
  constructor(rule: string, details?: Record<string, unknown>) {
    super(
      `Business rule violation: ${rule}`,
      ErrorCode.BUSINESS_RULE_VIOLATION,
      undefined,
      {
        rule,
        ...details,
      },
    );
  }
}

/**
 * Thrown when operation is not allowed
 */
export class OperationNotAllowedException extends BaseException {
  constructor(
    operation: string,
    reason?: string,
    details?: Record<string, unknown>,
  ) {
    const message = reason
      ? `Operation '${operation}' not allowed: ${reason}`
      : `Operation '${operation}' not allowed`;
    super(message, ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED, undefined, {
      operation,
      reason,
      ...details,
    });
  }
}

/**
 * Thrown when user has insufficient permissions
 */
export class InsufficientPermissionsException extends BaseException {
  constructor(action: string, details?: Record<string, unknown>) {
    super(
      `Insufficient permissions for action: ${action}`,
      ErrorCode.BUSINESS_INSUFFICIENT_PERMISSIONS,
      undefined,
      {
        action,
        ...details,
      },
    );
  }
}

/**
 * Thrown when resource is in invalid state
 */
export class InvalidStateException extends BaseException {
  constructor(
    resource: string,
    currentState: string,
    expectedState: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `${resource} is in invalid state. Current: ${currentState}, Expected: ${expectedState}`,
      ErrorCode.BUSINESS_INVALID_STATE,
      undefined,
      {
        resource,
        currentState,
        expectedState,
        ...details,
      },
    );
  }
}

/**
 * Thrown when quota is exceeded
 */
export class QuotaExceededException extends BaseException {
  constructor(
    resource: string,
    limit: number,
    current: number,
    details?: Record<string, unknown>,
  ) {
    super(
      `Quota exceeded for ${resource}. Limit: ${limit}, Current: ${current}`,
      ErrorCode.BUSINESS_QUOTA_EXCEEDED,
      undefined,
      {
        resource,
        limit,
        current,
        ...details,
      },
    );
  }
}

// ==========================================
// System Exceptions
// ==========================================

/**
 * Thrown when internal system error occurs
 */
export class InternalServerException extends BaseException {
  constructor(
    message = 'Internal server error',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.SYSTEM_INTERNAL_ERROR, undefined, details, false);
  }
}

/**
 * Thrown when service is unavailable
 */
export class ServiceUnavailableException extends BaseException {
  constructor(service: string, details?: Record<string, unknown>) {
    super(
      `Service '${service}' is unavailable`,
      ErrorCode.SYSTEM_SERVICE_UNAVAILABLE,
      undefined,
      {
        service,
        ...details,
      },
    );
  }
}

/**
 * Thrown when configuration error occurs
 */
export class ConfigurationException extends BaseException {
  constructor(config: string, details?: Record<string, unknown>) {
    super(
      `Configuration error: ${config}`,
      ErrorCode.SYSTEM_CONFIGURATION_ERROR,
      undefined,
      {
        config,
        ...details,
      },
      false,
    );
  }
}

/**
 * Thrown when file system error occurs
 */
export class FileSystemException extends BaseException {
  constructor(
    message = 'File system error',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.SYSTEM_FILE_SYSTEM_ERROR, undefined, details);
  }
}

/**
 * Thrown when operation times out
 */
export class TimeoutException extends BaseException {
  constructor(
    operation: string,
    timeout: number,
    details?: Record<string, unknown>,
  ) {
    super(
      `Operation '${operation}' timed out after ${timeout}ms`,
      ErrorCode.SYSTEM_TIMEOUT,
      undefined,
      {
        operation,
        timeout,
        ...details,
      },
    );
  }
}

// ==========================================
// External Service Exceptions
// ==========================================

/**
 * Thrown when external service error occurs
 */
export class ExternalServiceException extends BaseException {
  constructor(
    service: string,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(
      message || `External service '${service}' error`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      undefined,
      {
        service,
        ...details,
      },
    );
  }
}

/**
 * Thrown when external API call fails
 */
export class ExternalAPIException extends BaseException {
  constructor(
    api: string,
    statusCode?: number,
    details?: Record<string, unknown>,
  ) {
    super(
      `External API '${api}' error`,
      ErrorCode.EXTERNAL_API_ERROR,
      undefined,
      {
        api,
        statusCode,
        ...details,
      },
    );
  }
}

/**
 * Thrown when external service times out
 */
export class ExternalTimeoutException extends BaseException {
  constructor(
    service: string,
    timeout: number,
    details?: Record<string, unknown>,
  ) {
    super(
      `External service '${service}' timed out after ${timeout}ms`,
      ErrorCode.EXTERNAL_TIMEOUT,
      undefined,
      {
        service,
        timeout,
        ...details,
      },
    );
  }
}

// ==========================================
// Rate Limiting Exceptions
// ==========================================

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitExceededException extends BaseException {
  constructor(
    limit: number,
    window: number,
    details?: Record<string, unknown>,
  ) {
    super(
      `Rate limit exceeded: ${limit} requests per ${window}ms`,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      undefined,
      {
        limit,
        window,
        ...details,
      },
    );
  }
}

/**
 * Thrown when IP is blocked
 */
export class IPBlockedException extends BaseException {
  constructor(ip: string, details?: Record<string, unknown>) {
    super(
      `IP '${ip}' has been blocked`,
      ErrorCode.RATE_LIMIT_IP_BLOCKED,
      undefined,
      {
        ip,
        ...details,
      },
    );
  }
}

// ==========================================
// File Upload Exceptions
// ==========================================

/**
 * Thrown when file is too large
 */
export class FileTooLargeException extends BaseException {
  constructor(
    maxSize: number,
    actualSize: number,
    details?: Record<string, unknown>,
  ) {
    super(
      `File size ${actualSize} bytes exceeds maximum ${maxSize} bytes`,
      ErrorCode.FILE_TOO_LARGE,
      undefined,
      {
        maxSize,
        actualSize,
        ...details,
      },
    );
  }
}

/**
 * Thrown when file type is invalid
 */
export class InvalidFileTypeException extends BaseException {
  constructor(
    allowedTypes: string[],
    actualType: string,
    details?: Record<string, unknown>,
  ) {
    super(
      `Invalid file type '${actualType}'. Allowed types: ${allowedTypes.join(', ')}`,
      ErrorCode.FILE_INVALID_TYPE,
      undefined,
      {
        allowedTypes,
        actualType,
        ...details,
      },
    );
  }
}

/**
 * Thrown when file upload fails
 */
export class FileUploadException extends BaseException {
  constructor(
    message = 'File upload failed',
    details?: Record<string, unknown>,
  ) {
    super(message, ErrorCode.FILE_UPLOAD_FAILED, undefined, details);
  }
}
