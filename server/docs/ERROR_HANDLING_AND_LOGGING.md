# Error Handling, Logging & Monitoring Guide

**Production-Ready Error Infrastructure for NestJS**

This comprehensive guide covers all aspects of error handling, structured logging, and error monitoring with Sentry in this project.

---

## Table of Contents

1. [Overview](#overview)
2. [Error Code Standardization](#error-code-standardization)
3. [Custom Exception Library](#custom-exception-library)
4. [Winston Logger Service](#winston-logger-service)
5. [Request Logging & Correlation IDs](#request-logging--correlation-ids)
6. [Global Exception Filter](#global-exception-filter)
7. [Sentry Error Monitoring](#sentry-error-monitoring)
8. [Best Practices](#best-practices)
9. [Examples & Patterns](#examples--patterns)

---

## Overview

### Features Implemented

✅ **Standardized Error Codes** (70+ codes across 9 categories)
✅ **Custom Exception Library** (40+ type-safe exception classes)
✅ **Winston Logger** (Structured logging with daily rotation)
✅ **Correlation IDs** (Track requests across logs and errors)
✅ **Global Exception Filter** (Consistent error responses)
✅ **Sentry Integration** (Error monitoring and performance tracking)
✅ **Environment-Aware** (Detailed errors in dev, generic in prod)

### Architecture

```
Incoming Request
    ↓
┌─────────────────────────────┐
│ Request Logging Middleware  │ → Generate Correlation ID
│ (Correlation ID)            │ → Log request details
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Application Logic           │ → Service/Controller
│ (Business Logic)            │ → Throw custom exceptions
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Global Exception Filter     │ → Catch all exceptions
│ (Error Handling)            │ → Log error with correlation ID
└─────────────────────────────┘ → Send to Sentry (if enabled)
    ↓                           → Return consistent error response
Response with Error + Correlation ID
```

---

## Error Code Standardization

### File: `src/common/enums/error-codes.enum.ts`

**70+ standardized error codes** organized by category with HTTP status mapping.

### Error Code Categories

| Category | Code Range | Description |
|----------|------------|-------------|
| **AUTH** | 1000-1099 | Authentication & authorization errors |
| **VAL** | 2000-2099 | Validation & input errors |
| **DB** | 3000-3099 | Database & query errors |
| **RES** | 4000-4099 | Resource not found & access errors |
| **BUS** | 5000-5099 | Business logic violations |
| **SYS** | 6000-6099 | System & internal errors |
| **EXT** | 7000-7099 | External service errors |
| **RATE** | 8000-8099 | Rate limiting errors |
| **FILE** | 9000-9099 | File upload errors |

### Example Error Codes

```typescript
export enum ErrorCode {
  // Authentication (1000-1099)
  AUTH_001 = 'AUTH_001', // Invalid credentials
  AUTH_002 = 'AUTH_002', // Unauthorized access
  AUTH_003 = 'AUTH_003', // Token expired

  // Validation (2000-2099)
  VAL_001 = 'VAL_001', // Missing required field
  VAL_002 = 'VAL_002', // Invalid format
  VAL_003 = 'VAL_003', // Value out of range

  // Database (3000-3099)
  DB_001 = 'DB_001', // Connection failed
  DB_002 = 'DB_002', // Query error
  DB_003 = 'DB_003', // Unique constraint violation

  // ... 60+ more codes
}
```

### HTTP Status Mapping

```typescript
export const ErrorCodeToHttpStatus: Record<ErrorCode, HttpStatus> = {
  [ErrorCode.AUTH_001]: HttpStatus.UNAUTHORIZED,      // 401
  [ErrorCode.VAL_001]: HttpStatus.BAD_REQUEST,        // 400
  [ErrorCode.DB_003]: HttpStatus.CONFLICT,            // 409
  [ErrorCode.RES_001]: HttpStatus.NOT_FOUND,          // 404
  // ... all mappings defined
};
```

### Production Messages (Generic)

```typescript
export const ErrorCodeToProductionMessage: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_001]: 'Authentication failed',
  [ErrorCode.VAL_001]: 'Invalid input provided',
  [ErrorCode.DB_001]: 'Database error occurred',
  // ... all generic messages defined
};
```

---

## Custom Exception Library

### File: `src/common/exceptions/custom-exceptions.ts`

**40+ custom exception classes** extending `BaseException`.

### BaseException Class

```typescript
export class BaseException extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    public readonly message: string,
    public readonly isOperational: boolean = true, // Expected errors
    public readonly metadata?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  getHttpStatus(): HttpStatus {
    return ErrorCodeToHttpStatus[this.errorCode] || HttpStatus.INTERNAL_SERVER_ERROR;
  }

  getProductionMessage(): string {
    return ErrorCodeToProductionMessage[this.errorCode] || 'An error occurred';
  }
}
```

### Available Exceptions

**Authentication Exceptions:**
```typescript
InvalidCredentialsException
UnauthorizedException
TokenExpiredException
TokenInvalidException
InsufficientPermissionsException
AccountLockedException
AccountNotVerifiedException
RefreshTokenExpiredException
```

**Validation Exceptions:**
```typescript
ValidationException
MissingRequiredFieldException
InvalidFormatException
ValueOutOfRangeException
InvalidEmailException
WeakPasswordException
DataIntegrityViolationException
```

**Resource Exceptions:**
```typescript
ResourceNotFoundException
UserNotFoundException
RecordNotFoundException
EndpointNotFoundException
RouteNotFoundException
AccessDeniedException
ResourceAlreadyExistsException
```

**Database Exceptions:**
```typescript
DatabaseConnectionException
DatabaseQueryException
DuplicateEntryException
ForeignKeyConstraintException
DatabaseTimeoutException
DatabaseTransactionException
DatabaseIndexException
```

**Business Logic Exceptions:**
```typescript
BusinessRuleViolationException
InsufficientBalanceException
InvalidOperationException
StatusTransitionException
DuplicateOperationException
OperationNotAllowedException
```

**System Exceptions:**
```typescript
InternalServerException
ConfigurationException
ServiceUnavailableException
TimeoutException
DependencyFailureException
SystemMaintenanceException
```

**External Service Exceptions:**
```typescript
ExternalServiceException
ThirdPartyAPIException
PaymentGatewayException
EmailServiceException
StorageServiceException
```

**Rate Limiting Exceptions:**
```typescript
RateLimitExceededException
TooManyRequestsException
```

**File Upload Exceptions:**
```typescript
FileTooLargeException
InvalidFileTypeException
FileUploadException
StorageQuotaExceededException
```

### Usage Examples

```typescript
import {
  InvalidCredentialsException,
  ResourceNotFoundException,
  ValidationException,
} from '../common/exceptions';

// Authentication error
if (!user || !isPasswordValid) {
  throw new InvalidCredentialsException('email or password');
}

// Resource not found
const user = await this.userRepository.findOne({ where: { id } });
if (!user) {
  throw new ResourceNotFoundException('User', id);
}

// Validation error
if (!dto.email || !dto.email.includes('@')) {
  throw new ValidationException('Invalid email format');
}

// Business logic error
if (user.balance < amount) {
  throw new InsufficientBalanceException('withdraw', amount);
}

// Database error (operational - don't send to Sentry)
try {
  await this.userRepository.save(user);
} catch (error) {
  if (error.code === '23505') {
    throw new DuplicateEntryException('User', 'email', dto.email);
  }
  // Unknown error - let it bubble up (will be sent to Sentry)
  throw error;
}
```

---

## Winston Logger Service

### File: `src/common/logger/logger.service.ts`

**Structured logging** with Winston including:
- Multiple log levels (error, warn, info, debug, verbose)
- Console transport with colors (development)
- Daily rotating file transports
- JSON format for production
- Correlation ID support
- Specialized logging methods

### Log Levels

| Level | When to Use |
|-------|-------------|
| **error** | Fatal errors, exceptions, system failures |
| **warn** | Warnings, deprecated features, slow queries |
| **info** | General information, startup, configuration |
| **debug** | Debugging information, detailed flow |
| **verbose** | Very detailed logs, trace-level |

### Log Transports

**Console Transport:**
- Colored output in development
- JSON format in production
- Always enabled

**File Transports:**
1. **error-%DATE%.log** (Retention: 30 days)
   - Error level and above
   - Includes stack traces

2. **combined-%DATE%.log** (Retention: 14 days)
   - All log levels
   - General application logs

3. **access-%DATE%.log** (Retention: 7 days)
   - HTTP request/response logs
   - Includes timing and status codes

### Basic Logging Methods

```typescript
import { LoggerService } from './common/logger/logger.service';

@Injectable()
export class SomeService {
  constructor(private readonly logger: LoggerService) {}

  someMethod() {
    // Info log
    this.logger.log('User created successfully', 'SomeService', {
      userId: '123',
      email: 'user@example.com',
    });

    // Error log
    this.logger.error('Failed to create user', error.stack, 'SomeService', {
      email: dto.email,
      errorCode: 'DB_001',
    });

    // Warning log
    this.logger.warn('Slow query detected', 'SomeService', {
      query: 'SELECT * FROM users',
      duration: 1500,
    });

    // Debug log
    this.logger.debug('Processing request', 'SomeService', {
      requestId: req.id,
      params: req.params,
    });
  }
}
```

### Specialized Logging Methods

**1. Request Logging:**
```typescript
this.logger.logRequest({
  method: 'POST',
  url: '/api/v1/users',
  statusCode: 201,
  duration: 150,
  correlationId: 'abc-123-def',
  userId: 'user-id-123',
});
```

**2. Database Query Logging:**
```typescript
this.logger.logQuery({
  query: 'SELECT * FROM users WHERE email = $1',
  duration: 45,
  correlationId: 'abc-123-def',
});
```

**3. External API Logging:**
```typescript
this.logger.logExternalAPI({
  service: 'PaymentGateway',
  method: 'POST',
  url: 'https://api.stripe.com/v1/charges',
  statusCode: 200,
  duration: 320,
  correlationId: 'abc-123-def',
});
```

**4. Event Logging:**
```typescript
this.logger.logEvent({
  eventName: 'UserRegistered',
  userId: 'user-id-123',
  email: 'user@example.com',
  correlationId: 'abc-123-def',
});
```

**5. Security Event Logging:**
```typescript
this.logger.logSecurity({
  event: 'FailedLoginAttempt',
  userId: 'user-id-123',
  ip: '192.168.1.1',
  reason: 'Invalid password',
  correlationId: 'abc-123-def',
});
```

**6. Performance Logging:**
```typescript
this.logger.logPerformance({
  operation: 'BulkUserImport',
  duration: 5420,
  recordsProcessed: 1000,
  correlationId: 'abc-123-def',
});
```

### Child Logger

Create child loggers for specific contexts:

```typescript
const childLogger = this.logger.createChildLogger('AuthService');
childLogger.log('Login attempt', 'Login', { email: dto.email });
```

---

## Request Logging & Correlation IDs

### File: `src/common/middleware/request-logging.middleware.ts`

**Automatically logs all HTTP requests** with:
- Correlation ID generation (UUID v4)
- Request metadata (method, URL, IP, user agent)
- Response metadata (status, size, duration)
- Slow request detection (>1000ms)
- Error logging (4xx, 5xx)

### Correlation ID Flow

```
1. Request arrives → Middleware generates UUID
2. UUID stored in req.correlationId
3. UUID added to response header (X-Correlation-Id)
4. UUID included in all logs for this request
5. UUID included in error responses
6. UUID sent to Sentry for error tracking
```

### Request Log Format

```json
{
  "level": "info",
  "message": "Incoming request",
  "context": "RequestLogger",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "url": "/api/v1/users",
  "ip": "::1",
  "userAgent": "Mozilla/5.0...",
  "userId": "user-id-123",
  "timestamp": "2026-01-28T10:30:00.000Z"
}
```

### Response Log Format

```json
{
  "level": "info",
  "message": "Request completed",
  "context": "RequestLogger",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "url": "/api/v1/users",
  "statusCode": 201,
  "responseTime": 150,
  "userId": "user-id-123",
  "responseSize": 1024,
  "timestamp": "2026-01-28T10:30:00.150Z"
}
```

### Slow Request Detection

Requests taking >1000ms are automatically logged as warnings:

```json
{
  "level": "warn",
  "message": "Slow request detected",
  "context": "RequestLogger",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "GET",
  "url": "/api/v1/users?page=1&limit=100",
  "responseTime": 1523,
  "timestamp": "2026-01-28T10:30:01.523Z"
}
```

### Integration in main.ts

```typescript
// Request logging middleware with correlation IDs
const requestLoggingMiddleware = new RequestLoggingMiddleware(loggerService);
app.use(requestLoggingMiddleware.use.bind(requestLoggingMiddleware));
```

---

## Global Exception Filter

### File: `src/common/filters/global-exception.filter.ts`

**Catches ALL exceptions** and provides:
- Consistent error response format
- Automatic error logging
- Sentry integration
- Environment-aware messages
- Correlation ID tracking
- Sensitive data sanitization

### Error Response Format

**Development Environment:**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed: email must be a valid email",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "VAL_002",
  "details": {
    "field": "email",
    "value": "invalid-email",
    "constraint": "isEmail"
  },
  "stack": "Error: Validation failed\n    at UserController..."
}
```

**Production Environment:**
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid input provided",
  "timestamp": "2026-01-28T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "VAL_002"
}
```

### Exception Handling Flow

```typescript
catch(exception: unknown, host: ArgumentsHost) {
  // 1. Extract request and response
  const ctx = host.switchToHttp();
  const request = ctx.getRequest();
  const response = ctx.getResponse();

  // 2. Determine exception type
  if (exception instanceof BaseException) {
    // Custom exception with error code
    return this.handleBaseException(exception, request, response);
  } else if (exception instanceof HttpException) {
    // NestJS HTTP exception
    return this.handleHttpException(exception, request, response);
  } else if (exception instanceof Error) {
    // Standard JavaScript error
    return this.handleStandardError(exception, request, response);
  } else {
    // Unknown exception
    return this.handleUnknownException(exception, request, response);
  }
}
```

### Sentry Integration

- **Operational errors** (expected business logic errors) are NOT sent to Sentry
- **Non-operational errors** (unexpected system errors) are sent to Sentry
- All errors are logged locally regardless

```typescript
// Don't send to Sentry (operational)
throw new InvalidCredentialsException('email');
throw new ResourceNotFoundException('User', id);

// Send to Sentry (non-operational)
throw new InternalServerException('Database connection failed');
throw new Error('Unexpected null pointer');
```

### Integration in app.module.ts

```typescript
{
  provide: APP_FILTER,
  useFactory: (configService: ConfigService, loggerService: LoggerService) => {
    return new GlobalExceptionFilter(configService, loggerService);
  },
  inject: [ConfigService, LoggerService],
}
```

---

## Sentry Error Monitoring

### File: `src/config/sentry.config.ts`

**Error monitoring and performance tracking** with:
- Error tracking with stack traces
- Performance monitoring (traces)
- Profiling integration
- Request/response breadcrumbs
- User context tracking
- Environment-based configuration

### Configuration

**Environment Variables:**
```env
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=1.0
SENTRY_PROFILES_SAMPLE_RATE=1.0
SENTRY_SERVER_NAME=api-server-01
APP_VERSION=1.0.0
```

### Initialization

```typescript
import { initializeSentry } from './config/sentry.config';

// In main.ts
const configService = app.get(ConfigService);
initializeSentry(configService);
```

### Manual Error Capture

```typescript
import { captureSentryException, captureSentryMessage } from './config/sentry.config';

// Capture exception
try {
  await dangerousOperation();
} catch (error) {
  captureSentryException(error, {
    userId: user.id,
    operation: 'dangerousOperation',
  });
  throw error;
}

// Capture message
captureSentryMessage('Critical event occurred', 'warning', {
  eventType: 'SystemAlert',
  severity: 'high',
});
```

### Performance Tracking

```typescript
import { startSentrySpan } from './config/sentry.config';

const span = startSentrySpan('BulkUserImport', 'task');
try {
  await importUsers(file);
  span.end();
} catch (error) {
  span.end();
  throw error;
}
```

### Breadcrumbs

```typescript
import { addSentryBreadcrumb } from './config/sentry.config';

addSentryBreadcrumb('user', 'User logged in', {
  userId: user.id,
  email: user.email,
}, 'info');
```

### Filtering

**Operational errors are filtered out:**
```typescript
beforeSend(event, hint) {
  const error = hint.originalException as Error & { isOperational?: boolean };

  if (error?.isOperational) {
    return null; // Don't send to Sentry
  }

  return event;
}
```

**Sensitive data is sanitized:**
```typescript
beforeSend(event, hint) {
  if (event.request?.headers) {
    delete event.request.headers['authorization'];
    delete event.request.headers['cookie'];
  }
  return event;
}
```

---

## Best Practices

### 1. Use Appropriate Exception Classes

```typescript
// ✅ GOOD - Use specific exception
throw new ResourceNotFoundException('User', userId);

// ❌ BAD - Generic error
throw new Error('User not found');
```

### 2. Include Metadata

```typescript
// ✅ GOOD - Include context
throw new ValidationException('Invalid email format', {
  field: 'email',
  value: dto.email,
  constraint: 'isEmail',
});

// ❌ BAD - No context
throw new ValidationException('Invalid email');
```

### 3. Log at Appropriate Levels

```typescript
// ✅ GOOD - Use correct levels
this.logger.error('Database connection failed', error.stack);
this.logger.warn('Slow query detected', 'QueryLogger', { duration: 1500 });
this.logger.info('User created successfully', 'UserService', { userId });
this.logger.debug('Processing request', 'Controller', { params });

// ❌ BAD - Everything is error
this.logger.error('User created');
this.logger.error('Processing request');
```

### 4. Use Correlation IDs

```typescript
// ✅ GOOD - Include correlation ID
this.logger.log('Operation completed', 'Service', {
  correlationId: req.correlationId,
  userId: user.id,
});

// ❌ BAD - No correlation ID
this.logger.log('Operation completed');
```

### 5. Don't Log Sensitive Data

```typescript
// ✅ GOOD - Sanitize sensitive fields
this.logger.log('User login attempt', 'AuthService', {
  email: dto.email,
  // Don't log password
});

// ❌ BAD - Logging password
this.logger.log('Login attempt', 'AuthService', {
  email: dto.email,
  password: dto.password, // NEVER DO THIS
});
```

### 6. Operational vs Non-Operational Errors

```typescript
// ✅ GOOD - Operational (expected)
throw new InvalidCredentialsException('email'); // isOperational = true

// ✅ GOOD - Non-operational (unexpected)
throw new InternalServerException('Null pointer', false); // isOperational = false
```

---

## Examples & Patterns

### Pattern 1: Controller with Full Error Handling

```typescript
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly logger: LoggerService,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const correlationId = req.correlationId;

    this.logger.log('Creating user', 'UsersController', {
      correlationId,
      email: dto.email,
    });

    try {
      return await this.usersService.create(dto, res);
    } catch (error) {
      this.logger.error('User creation failed', error.stack, 'UsersController', {
        correlationId,
        email: dto.email,
        errorCode: error.errorCode,
      });
      throw error; // Global exception filter will handle it
    }
  }
}
```

### Pattern 2: Service with Custom Exceptions

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateUserDto, res: Response): Promise<Response> {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new DuplicateEntryException('User', 'email', dto.email);
    }

    // Validate password strength
    if (dto.password.length < 8) {
      throw new WeakPasswordException('at least 8 characters');
    }

    try {
      const user = this.userRepository.create(dto);
      const savedUser = await this.userRepository.save(user);

      this.logger.log('User created successfully', 'UsersService', {
        userId: savedUser.id,
        email: savedUser.email,
      });

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedUser,
        message: 'User created successfully',
        meta: {
          user_id: savedUser.id,
          created_at: savedUser.createdAt,
        },
      });
    } catch (error) {
      // Database error (non-operational)
      this.logger.error('Database error', error.stack, 'UsersService', {
        email: dto.email,
      });

      throw new DatabaseQueryException('create user');
    }
  }
}
```

### Pattern 3: Async Operation with Sentry Tracking

```typescript
import {
  captureSentryException,
  startSentrySpan,
  addSentryBreadcrumb,
} from '../config/sentry.config';

async performCriticalOperation(data: unknown) {
  const span = startSentrySpan('CriticalOperation', 'task');

  addSentryBreadcrumb('operation', 'Started critical operation', {
    dataSize: JSON.stringify(data).length,
  }, 'info');

  try {
    const result = await this.processingService.process(data);
    span.end();
    return result;
  } catch (error) {
    captureSentryException(error, {
      operation: 'performCriticalOperation',
      dataSize: JSON.stringify(data).length,
    });
    span.end();
    throw error;
  }
}
```

---

## Environment Variables Reference

```env
# Logging Configuration
LOG_LEVEL=debug                    # Log level: error, warn, info, debug, verbose
LOG_DIR=logs                       # Log directory path
LOG_MAX_FILES=30d                  # Log retention period

# Sentry Error Monitoring
SENTRY_ENABLED=true               # Enable/disable Sentry
SENTRY_DSN=https://...             # Sentry project DSN
SENTRY_ENVIRONMENT=production      # Environment name
SENTRY_TRACES_SAMPLE_RATE=1.0      # Performance trace sampling (0.0-1.0)
SENTRY_PROFILES_SAMPLE_RATE=1.0    # Profiling sampling (0.0-1.0)
SENTRY_SERVER_NAME=api-server-01   # Server identifier
APP_VERSION=1.0.0                  # Application version
```

---

## Log Files Structure

```
logs/
  ├── error-2026-01-28.log        # Error logs (30 days retention)
  ├── error-2026-01-27.log
  ├── combined-2026-01-28.log     # All logs (14 days retention)
  ├── combined-2026-01-27.log
  ├── access-2026-01-28.log       # HTTP logs (7 days retention)
  └── access-2026-01-27.log
```

---

## Testing Error Handling

### Test Custom Exceptions

```typescript
describe('UsersService', () => {
  it('should throw DuplicateEntryException if email exists', async () => {
    jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);

    await expect(service.create(dto, res))
      .rejects.toThrow(DuplicateEntryException);
  });

  it('should throw WeakPasswordException if password is too short', async () => {
    const dto = { ...createDto, password: '123' };

    await expect(service.create(dto, res))
      .rejects.toThrow(WeakPasswordException);
  });
});
```

### Test Error Responses

```typescript
describe('UsersController E2E', () => {
  it('should return 409 if email exists', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .send({ email: 'existing@example.com', ... })
      .expect(409)
      .expect((res) => {
        expect(res.body.errorCode).toBe('DB_003');
        expect(res.body.correlationId).toBeDefined();
      });
  });
});
```

---

## Troubleshooting

### Issue: Logs not appearing in files

**Solution:** Check LOG_DIR environment variable and file permissions.

```bash
mkdir -p logs
chmod 755 logs
```

### Issue: Sentry not capturing errors

**Solution:** Verify SENTRY_ENABLED=true and SENTRY_DSN is configured.

```bash
# Test Sentry connection
curl -X POST https://sentry.io/api/0/projects/your-org/your-project/keys/
```

### Issue: Correlation IDs not in logs

**Solution:** Ensure RequestLoggingMiddleware is registered before other middleware.

```typescript
// In main.ts - Order matters
app.use(requestLoggingMiddleware.use.bind(requestLoggingMiddleware));
```

### Issue: Stack traces in production

**Solution:** Check NODE_ENV environment variable.

```env
NODE_ENV=production  # Stack traces hidden
NODE_ENV=development # Stack traces shown
```

---

## Summary

✅ **Error Codes**: 70+ standardized codes with HTTP status mapping
✅ **Custom Exceptions**: 40+ type-safe exception classes
✅ **Winston Logger**: Structured logging with daily rotation
✅ **Correlation IDs**: Track requests across logs and errors
✅ **Global Filter**: Consistent error responses with auto-logging
✅ **Sentry Integration**: Error monitoring and performance tracking
✅ **Environment-Aware**: Detailed errors in dev, generic in prod
✅ **Production-Ready**: Comprehensive error infrastructure

For more information, see:
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
- [Winston Logger](https://github.com/winstonjs/winston)
- [Sentry Node.js](https://docs.sentry.io/platforms/node/)

