/**
 * Standardized error codes for the application
 * Format: CATEGORY_ERROR_NAME
 *
 * Categories:
 * - AUTH: Authentication and authorization errors
 * - VALIDATION: Input validation errors
 * - DATABASE: Database operation errors
 * - RESOURCE: Resource not found or unavailable errors
 * - BUSINESS: Business logic errors
 * - SYSTEM: System and infrastructure errors
 * - EXTERNAL: Third-party service errors
 */
export enum ErrorCode {
  // Authentication & Authorization (1000-1099)
  AUTH_INVALID_CREDENTIALS = 'AUTH_001',
  AUTH_TOKEN_EXPIRED = 'AUTH_002',
  AUTH_TOKEN_INVALID = 'AUTH_003',
  AUTH_TOKEN_MISSING = 'AUTH_004',
  AUTH_UNAUTHORIZED = 'AUTH_005',
  AUTH_FORBIDDEN = 'AUTH_006',
  AUTH_EMAIL_NOT_VERIFIED = 'AUTH_007',
  AUTH_ACCOUNT_DISABLED = 'AUTH_008',
  AUTH_SESSION_EXPIRED = 'AUTH_009',
  AUTH_SESSION_INVALID = 'AUTH_010',

  // Validation Errors (2000-2099)
  VALIDATION_FAILED = 'VAL_001',
  VALIDATION_EMAIL_INVALID = 'VAL_002',
  VALIDATION_PASSWORD_WEAK = 'VAL_003',
  VALIDATION_REQUIRED_FIELD_MISSING = 'VAL_004',
  VALIDATION_FIELD_TOO_SHORT = 'VAL_005',
  VALIDATION_FIELD_TOO_LONG = 'VAL_006',
  VALIDATION_INVALID_FORMAT = 'VAL_007',
  VALIDATION_INVALID_UUID = 'VAL_008',
  VALIDATION_INVALID_DATE = 'VAL_009',
  VALIDATION_INVALID_ENUM_VALUE = 'VAL_010',

  // Database Errors (3000-3099)
  DATABASE_CONNECTION_FAILED = 'DB_001',
  DATABASE_QUERY_FAILED = 'DB_002',
  DATABASE_TRANSACTION_FAILED = 'DB_003',
  DATABASE_CONSTRAINT_VIOLATION = 'DB_004',
  DATABASE_DUPLICATE_ENTRY = 'DB_005',
  DATABASE_FOREIGN_KEY_VIOLATION = 'DB_006',
  DATABASE_TIMEOUT = 'DB_007',
  DATABASE_MIGRATION_FAILED = 'DB_008',

  // Resource Errors (4000-4099)
  RESOURCE_NOT_FOUND = 'RES_001',
  RESOURCE_ALREADY_EXISTS = 'RES_002',
  RESOURCE_CONFLICT = 'RES_003',
  RESOURCE_LOCKED = 'RES_004',
  RESOURCE_UNAVAILABLE = 'RES_005',
  RESOURCE_DELETED = 'RES_006',
  RESOURCE_ARCHIVED = 'RES_007',

  // Business Logic Errors (5000-5099)
  BUSINESS_RULE_VIOLATION = 'BUS_001',
  BUSINESS_OPERATION_NOT_ALLOWED = 'BUS_002',
  BUSINESS_INSUFFICIENT_PERMISSIONS = 'BUS_003',
  BUSINESS_INVALID_STATE = 'BUS_004',
  BUSINESS_QUOTA_EXCEEDED = 'BUS_005',
  BUSINESS_DEADLINE_PASSED = 'BUS_006',
  BUSINESS_PREREQUISITES_NOT_MET = 'BUS_007',

  // System Errors (6000-6099)
  SYSTEM_INTERNAL_ERROR = 'SYS_001',
  SYSTEM_SERVICE_UNAVAILABLE = 'SYS_002',
  SYSTEM_CONFIGURATION_ERROR = 'SYS_003',
  SYSTEM_FILE_SYSTEM_ERROR = 'SYS_004',
  SYSTEM_MEMORY_ERROR = 'SYS_005',
  SYSTEM_TIMEOUT = 'SYS_006',
  SYSTEM_DEPENDENCY_ERROR = 'SYS_007',

  // External Service Errors (7000-7099)
  EXTERNAL_SERVICE_ERROR = 'EXT_001',
  EXTERNAL_API_ERROR = 'EXT_002',
  EXTERNAL_TIMEOUT = 'EXT_003',
  EXTERNAL_RATE_LIMIT_EXCEEDED = 'EXT_004',
  EXTERNAL_AUTHENTICATION_FAILED = 'EXT_005',
  EXTERNAL_RESPONSE_INVALID = 'EXT_006',

  // Rate Limiting Errors (8000-8099)
  RATE_LIMIT_EXCEEDED = 'RATE_001',
  RATE_LIMIT_IP_BLOCKED = 'RATE_002',
  RATE_LIMIT_USER_BLOCKED = 'RATE_003',

  // File Upload Errors (9000-9099)
  FILE_TOO_LARGE = 'FILE_001',
  FILE_INVALID_TYPE = 'FILE_002',
  FILE_UPLOAD_FAILED = 'FILE_003',
  FILE_NOT_FOUND = 'FILE_004',
  FILE_PROCESSING_FAILED = 'FILE_005',
}

/**
 * Map error codes to HTTP status codes
 */
export const ErrorCodeToHttpStatus: Record<ErrorCode, number> = {
  // Authentication & Authorization -> 401/403
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_TOKEN_INVALID]: 401,
  [ErrorCode.AUTH_TOKEN_MISSING]: 401,
  [ErrorCode.AUTH_UNAUTHORIZED]: 401,
  [ErrorCode.AUTH_FORBIDDEN]: 403,
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 403,
  [ErrorCode.AUTH_ACCOUNT_DISABLED]: 403,
  [ErrorCode.AUTH_SESSION_EXPIRED]: 401,
  [ErrorCode.AUTH_SESSION_INVALID]: 401,

  // Validation -> 400
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.VALIDATION_EMAIL_INVALID]: 400,
  [ErrorCode.VALIDATION_PASSWORD_WEAK]: 400,
  [ErrorCode.VALIDATION_REQUIRED_FIELD_MISSING]: 400,
  [ErrorCode.VALIDATION_FIELD_TOO_SHORT]: 400,
  [ErrorCode.VALIDATION_FIELD_TOO_LONG]: 400,
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 400,
  [ErrorCode.VALIDATION_INVALID_UUID]: 400,
  [ErrorCode.VALIDATION_INVALID_DATE]: 400,
  [ErrorCode.VALIDATION_INVALID_ENUM_VALUE]: 400,

  // Database -> 500/409
  [ErrorCode.DATABASE_CONNECTION_FAILED]: 503,
  [ErrorCode.DATABASE_QUERY_FAILED]: 500,
  [ErrorCode.DATABASE_TRANSACTION_FAILED]: 500,
  [ErrorCode.DATABASE_CONSTRAINT_VIOLATION]: 409,
  [ErrorCode.DATABASE_DUPLICATE_ENTRY]: 409,
  [ErrorCode.DATABASE_FOREIGN_KEY_VIOLATION]: 409,
  [ErrorCode.DATABASE_TIMEOUT]: 504,
  [ErrorCode.DATABASE_MIGRATION_FAILED]: 500,

  // Resource -> 404/409
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 409,
  [ErrorCode.RESOURCE_CONFLICT]: 409,
  [ErrorCode.RESOURCE_LOCKED]: 423,
  [ErrorCode.RESOURCE_UNAVAILABLE]: 503,
  [ErrorCode.RESOURCE_DELETED]: 410,
  [ErrorCode.RESOURCE_ARCHIVED]: 410,

  // Business Logic -> 400/422
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 422,
  [ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED]: 403,
  [ErrorCode.BUSINESS_INSUFFICIENT_PERMISSIONS]: 403,
  [ErrorCode.BUSINESS_INVALID_STATE]: 422,
  [ErrorCode.BUSINESS_QUOTA_EXCEEDED]: 429,
  [ErrorCode.BUSINESS_DEADLINE_PASSED]: 422,
  [ErrorCode.BUSINESS_PREREQUISITES_NOT_MET]: 422,

  // System -> 500/503
  [ErrorCode.SYSTEM_INTERNAL_ERROR]: 500,
  [ErrorCode.SYSTEM_SERVICE_UNAVAILABLE]: 503,
  [ErrorCode.SYSTEM_CONFIGURATION_ERROR]: 500,
  [ErrorCode.SYSTEM_FILE_SYSTEM_ERROR]: 500,
  [ErrorCode.SYSTEM_MEMORY_ERROR]: 500,
  [ErrorCode.SYSTEM_TIMEOUT]: 504,
  [ErrorCode.SYSTEM_DEPENDENCY_ERROR]: 503,

  // External Services -> 502/503/504
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 502,
  [ErrorCode.EXTERNAL_API_ERROR]: 502,
  [ErrorCode.EXTERNAL_TIMEOUT]: 504,
  [ErrorCode.EXTERNAL_RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.EXTERNAL_AUTHENTICATION_FAILED]: 502,
  [ErrorCode.EXTERNAL_RESPONSE_INVALID]: 502,

  // Rate Limiting -> 429
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCode.RATE_LIMIT_IP_BLOCKED]: 429,
  [ErrorCode.RATE_LIMIT_USER_BLOCKED]: 429,

  // File Upload -> 400/413
  [ErrorCode.FILE_TOO_LARGE]: 413,
  [ErrorCode.FILE_INVALID_TYPE]: 400,
  [ErrorCode.FILE_UPLOAD_FAILED]: 500,
  [ErrorCode.FILE_NOT_FOUND]: 404,
  [ErrorCode.FILE_PROCESSING_FAILED]: 500,
};

/**
 * User-friendly error messages for production
 * Generic messages that don't leak sensitive information
 */
export const ErrorCodeToProductionMessage: Record<ErrorCode, string> = {
  // Authentication & Authorization
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid credentials provided',
  [ErrorCode.AUTH_TOKEN_EXPIRED]:
    'Your session has expired. Please login again',
  [ErrorCode.AUTH_TOKEN_INVALID]: 'Authentication token is invalid',
  [ErrorCode.AUTH_TOKEN_MISSING]: 'Authentication required',
  [ErrorCode.AUTH_UNAUTHORIZED]:
    'You are not authorized to perform this action',
  [ErrorCode.AUTH_FORBIDDEN]: 'Access to this resource is forbidden',
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'Please verify your email address',
  [ErrorCode.AUTH_ACCOUNT_DISABLED]: 'Your account has been disabled',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired',
  [ErrorCode.AUTH_SESSION_INVALID]: 'Invalid session',

  // Validation
  [ErrorCode.VALIDATION_FAILED]: 'The provided data is invalid',
  [ErrorCode.VALIDATION_EMAIL_INVALID]: 'Please provide a valid email address',
  [ErrorCode.VALIDATION_PASSWORD_WEAK]:
    'Password does not meet security requirements',
  [ErrorCode.VALIDATION_REQUIRED_FIELD_MISSING]: 'Required field is missing',
  [ErrorCode.VALIDATION_FIELD_TOO_SHORT]: 'Field value is too short',
  [ErrorCode.VALIDATION_FIELD_TOO_LONG]: 'Field value is too long',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid format provided',
  [ErrorCode.VALIDATION_INVALID_UUID]: 'Invalid ID format',
  [ErrorCode.VALIDATION_INVALID_DATE]: 'Invalid date format',
  [ErrorCode.VALIDATION_INVALID_ENUM_VALUE]: 'Invalid value provided',

  // Database
  [ErrorCode.DATABASE_CONNECTION_FAILED]:
    'Database service is temporarily unavailable',
  [ErrorCode.DATABASE_QUERY_FAILED]:
    'An error occurred while processing your request',
  [ErrorCode.DATABASE_TRANSACTION_FAILED]: 'Transaction could not be completed',
  [ErrorCode.DATABASE_CONSTRAINT_VIOLATION]: 'Data constraint violation',
  [ErrorCode.DATABASE_DUPLICATE_ENTRY]:
    'A record with this information already exists',
  [ErrorCode.DATABASE_FOREIGN_KEY_VIOLATION]:
    'Cannot complete operation due to related records',
  [ErrorCode.DATABASE_TIMEOUT]: 'Request timeout - please try again',
  [ErrorCode.DATABASE_MIGRATION_FAILED]: 'Database migration error',

  // Resource
  [ErrorCode.RESOURCE_NOT_FOUND]: 'The requested resource was not found',
  [ErrorCode.RESOURCE_ALREADY_EXISTS]: 'Resource already exists',
  [ErrorCode.RESOURCE_CONFLICT]: 'Resource conflict detected',
  [ErrorCode.RESOURCE_LOCKED]: 'Resource is currently locked',
  [ErrorCode.RESOURCE_UNAVAILABLE]: 'Resource is temporarily unavailable',
  [ErrorCode.RESOURCE_DELETED]: 'Resource has been deleted',
  [ErrorCode.RESOURCE_ARCHIVED]: 'Resource has been archived',

  // Business Logic
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 'Operation violates business rules',
  [ErrorCode.BUSINESS_OPERATION_NOT_ALLOWED]: 'Operation not allowed',
  [ErrorCode.BUSINESS_INSUFFICIENT_PERMISSIONS]: 'Insufficient permissions',
  [ErrorCode.BUSINESS_INVALID_STATE]: 'Invalid state for this operation',
  [ErrorCode.BUSINESS_QUOTA_EXCEEDED]: 'Quota exceeded',
  [ErrorCode.BUSINESS_DEADLINE_PASSED]: 'Deadline has passed',
  [ErrorCode.BUSINESS_PREREQUISITES_NOT_MET]: 'Prerequisites not met',

  // System
  [ErrorCode.SYSTEM_INTERNAL_ERROR]:
    'An internal error occurred. Please try again later',
  [ErrorCode.SYSTEM_SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
  [ErrorCode.SYSTEM_CONFIGURATION_ERROR]: 'System configuration error',
  [ErrorCode.SYSTEM_FILE_SYSTEM_ERROR]: 'File system error occurred',
  [ErrorCode.SYSTEM_MEMORY_ERROR]: 'System resource error',
  [ErrorCode.SYSTEM_TIMEOUT]: 'Request timeout',
  [ErrorCode.SYSTEM_DEPENDENCY_ERROR]: 'Dependent service unavailable',

  // External Services
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 'External service error',
  [ErrorCode.EXTERNAL_API_ERROR]: 'External API error',
  [ErrorCode.EXTERNAL_TIMEOUT]: 'External service timeout',
  [ErrorCode.EXTERNAL_RATE_LIMIT_EXCEEDED]:
    'Too many requests to external service',
  [ErrorCode.EXTERNAL_AUTHENTICATION_FAILED]: 'External authentication failed',
  [ErrorCode.EXTERNAL_RESPONSE_INVALID]:
    'Invalid response from external service',

  // Rate Limiting
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please try again later',
  [ErrorCode.RATE_LIMIT_IP_BLOCKED]: 'Your IP has been temporarily blocked',
  [ErrorCode.RATE_LIMIT_USER_BLOCKED]:
    'Your account has been temporarily blocked',

  // File Upload
  [ErrorCode.FILE_TOO_LARGE]: 'File size exceeds maximum allowed',
  [ErrorCode.FILE_INVALID_TYPE]: 'Invalid file type',
  [ErrorCode.FILE_UPLOAD_FAILED]: 'File upload failed',
  [ErrorCode.FILE_NOT_FOUND]: 'File not found',
  [ErrorCode.FILE_PROCESSING_FAILED]: 'File processing failed',
};
