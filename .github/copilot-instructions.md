# GitHub Copilot Instructions for Fullstack NestJS + Next.js + PostgreSQL Template

## Project Overview

This is a production-ready fullstack template using:

- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js 16 with React 19, TypeScript, and Tailwind CSS
- **Database**: PostgreSQL with TypeORM
- **Language**: TypeScript throughout

## Code Standards & Best Practices

### General Guidelines

- Always use TypeScript with strict type checking
- **CRITICAL: NEVER use `any` type - use `unknown`, proper types, union types,
  or generics**
- **NO `any` types allowed in ANY file - frontend, backend, interfaces,
  services, components**
- Follow functional programming principles where applicable
- Prefer async/await over callbacks or raw promises
- Use meaningful variable and function names (camelCase for variables/functions,
  PascalCase for classes/types)
- Keep functions small and focused on a single responsibility
- **Always add professional code comments and documentation**

### Client-Side Specific Rules

- **NEVER use console.log, console.error, console.warn in production code**
  (only in JSDoc examples)
- **NEVER use JavaScript alert(), confirm(), or prompt() dialogs**
- **ALWAYS use custom Modal, Alert, or Confirm components instead of native
  dialogs**
- **Use proper logging service or remove debug statements before committing**
- **All interfaces must be in `interfaces/` folder with `.interface.ts`
  extension**
- **All types must be in `types/` folder with `.types.ts` extension**
- **All enums must be in `enums/` folder with `.enum.ts` extension**
- **All services must be in `lib/api/` folder with `.service.ts` extension**
- **NEVER define interfaces inline in component files - always import from
  `/interfaces`**
- **NEVER define types inline in files - always import from `/types`**
- **NEVER define enums inline in files - always import from `/enums`**
- **Properly distinguish between Server Components and Client Components**
- **Use 'use client' directive ONLY when component needs interactivity (state,
  effects, event handlers)**
- **Prefer Server Components by default for better performance**

### ESLint Rules - MANDATORY

- **NO unused variables** - ESLint will error, must be fixed before commit
- **NO unused imports** - ESLint will error, must be fixed before commit
- **NO implicit any types** - ESLint will error, must use explicit types
- **NO console statements** - ESLint will error (no console.log, console.error,
  etc.)
- **NO debugger statements** - ESLint will error
- Prefix unused parameters with underscore (`_param`) if required by interface
  but not used
- Run `yarn lint` before every commit to catch errors
- Fix all ESLint errors - **zero tolerance policy**

### Code Documentation Standards

- **All classes, interfaces, types, and enums must have JSDoc comments**
- **All public methods and functions must have JSDoc comments**
- **Complex logic and algorithms must be explained with inline comments**
- Use JSDoc tags: `@param`, `@returns`, `@throws`, `@example`, `@description`
- Comments should explain "why" not "what" (code should be self-explanatory)
- Keep comments up-to-date with code changes
- Use TODO/FIXME comments for pending work

### Documentation File Storage Standards

- **Feature-specific documentation**: Store in the feature's folder (e.g.,
  `src/cache/CACHE.md`, `src/auth/AUTH.md`)
- **Global/Project documentation**: Store in `docs/` folder at root level (e.g.,
  `server/docs/CACHING.md`, `client/docs/STATE_MANAGEMENT.md`)
- **API documentation**: Auto-generated Swagger/OpenAPI at runtime
- **Architecture documentation**: Store in `docs/architecture/` folder
- **Setup/deployment guides**: Store in `docs/guides/` folder
- Use UPPERCASE for doc filenames (e.g., `CACHE_IMPLEMENTATION.md`,
  `API_GUIDE.md`)
- Always update README.md with links to important documentation
- Both `server/docs/` and `client/docs/` folders exist for respective
  documentation

**Example:**

````typescript
/**
 * Service for managing user operations
 * Handles CRUD operations for users with proper validation and error handling
 */
@Injectable()
export class UsersService {
  /**
   * Creates a new user in the database
   *
   * @param createUserDto - The user data to create
   * @param res - Express response object for sending HTTP response
   * @returns Promise<Response> - HTTP response with created user data
   *
   * @example
   * ```typescript
   * const response = await usersService.create({
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * }, res);
   * ```
   */
  async create(createUserDto: CreateUserDto, res: Response): Promise<Response> {
    try {
      // Log operation start for debugging and monitoring
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Check if user already exists to prevent duplicates
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      // Return error if user already exists
      if (existingUser) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email already exists',
        });
      }

      // Create and save new user
      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      // Return success response with user data and metadata
      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedUser,
        message: 'User created successfully',
        meta: {
          userId: savedUser.id,
          createdAt: savedUser.createdAt,
        },
      });
    } catch (error) {
      // Log error for debugging
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      // Return standardized error response
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create user',
      });
    }
  }
}
````

### File Organization Standards - STRICT REQUIREMENTS

- **Interfaces**: ALL interfaces MUST be in `interfaces/` folder with
  `.interface.ts` extension
- **Types**: ALL type definitions MUST be in `types/` folder with `.types.ts`
  extension
- **Enums**: ALL enums MUST be in `enums/` folder with `.enum.ts` extension
- **NEVER define interfaces, types, or enums inline in component/service files**
- **ALWAYS import from centralized interface/type/enum files**
- Use barrel exports (index.ts) for each folder to simplify imports
- Update barrel exports immediately when adding new interfaces/types/enums
- Example structure:
  ```
  src/
    common/
      interfaces/
        api-response.interface.ts
        index.ts  # Export all interfaces
      types/
        response.types.ts
        index.ts  # Export all types
      enums/
        user-status.enum.ts
        index.ts  # Export all enums
  ```

### Code Organization Violations - FORBIDDEN

- ❌ Inline interface definitions in components:
  `interface ComponentProps { ... }`
- ❌ Inline type definitions: `type MyType = ...` (inside component files)
- ❌ Inline enum definitions: `enum Status { ... }` (inside component files)
- ❌ Duplicate interface definitions across files
- ✅ Always import: `import { ComponentProps } from '@/interfaces';`
- ✅ Centralized definitions in dedicated folders
- ✅ Single source of truth for all types/interfaces/enums

### Backend (NestJS) Standards

#### Reusable API Response Decorators - MANDATORY

**ALWAYS use reusable Swagger response decorators for consistency across all
controllers.**

**File:** `server/src/common/decorators/api-responses.decorator.ts`

**Available Decorators:**

1. **@ApiUnauthorizedResponse(path)** - Use for all protected endpoints
2. **@ApiBadRequestResponse(path)** - Use for validation errors
3. **@ApiConflictResponse(message, path)** - Use for duplicate resources
4. **@ApiNotFoundResponse(resourceName, path)** - Use for GET/PATCH/DELETE by ID
5. **@ApiForbiddenResponse(path)** - Use for permission errors
6. **@ApiInternalServerErrorResponse(path)** - Use as fallback for errors
7. **@ApiStandardProtectedResponses(path)** - Combined (401, 403, 500)
8. **@ApiStandardCrudResponses(resourceName, path)** - Combined (401, 404, 500)

**Import Pattern:**

```typescript
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '../common/decorators';
```

**Usage Examples:**

```typescript
// Protected endpoint with validation and conflict check
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Create a new user' })
@ApiResponseDecorator({
  status: HttpStatus.CREATED,
  description: 'User created successfully',
  schema: { example: { /* success response */ } }
})
@ApiBadRequestResponse('/api/v1/users')
@ApiConflictResponse('User with this email already exists', '/api/v1/users')
@ApiUnauthorizedResponse('/api/v1/users')
async create(@Body() createDto: CreateDto, @Res() res: Response) {
  return this.service.create(createDto, res);
}

// GET by ID with standard CRUD responses
@Get(':id')
@UseGuards(JwtAuthGuard)
@ApiOperation({ summary: 'Get user by ID' })
@ApiResponseDecorator({
  status: HttpStatus.OK,
  description: 'User found',
  schema: { example: { /* success response */ } }
})
@ApiStandardCrudResponses('User', '/api/v1/users/:id')
async findOne(@Param('id') id: string, @Res() res: Response) {
  return this.service.findOne(id, res);
}
```

**Benefits:**

- ✅ DRY principle - no repetitive Swagger code
- ✅ Consistent error responses across all endpoints
- ✅ Easy to maintain and update
- ✅ Automatic 401/403/404/500 documentation
- ✅ Professional API documentation

**Rules:**

- **NEVER write inline @ApiResponseDecorator for standard error codes (400, 401,
  404, 409, 500)**
- **ALWAYS use reusable decorators for error responses**
- **ONLY write custom @ApiResponseDecorator for success responses (200, 201)
  with examples**
- **Apply decorators in this order:** Success → BadRequest → Conflict →
  Unauthorized → NotFound

---

#### NestJS Code Patterns

**Controllers:**

- Keep controllers thin - only handle routing and delegation
- Always pass @Res() to service methods
- No try-catch blocks in controllers
- No business logic or response formatting in controllers
- Use proper HTTP methods and decorators
- Always use DTOs for request validation
- Use Swagger decorators for API documentation
- Use HttpStatus enum for status codes

```typescript
import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
} from '@nestjs/swagger';
import { Response } from 'express';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.create(createUserDto, res);
  }
}
```

**Services:**

- Implement business logic here
- Use dependency injection
- **Always accept Response parameter from controllers**
- **Always wrap async operations in try-catch blocks**
- Use Logger for error tracking and operation logging
- **Use ApiResponse.error() instead of throwing exceptions for
  validation/business logic errors**
- **Use ApiResponse.error() in catch blocks for unexpected errors**
- Include meaningful metadata in responses

```typescript
import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiResponse } from '../common/utils/api-response.util';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, res: Response): Promise<Response> {
    try {
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Check if user already exists - return error instead of throwing
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email already exists',
        });
      }

      const user = this.usersRepository.create(createUserDto);
      const savedUser = await this.usersRepository.save(user);

      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedUser,
        message: 'User created successfully',
        meta: {
          userId: savedUser.id,
          createdAt: savedUser.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create user',
      });
    }
  }
}
```

**DTOs (Data Transfer Objects):**

- Use class-validator decorators for validation
- Add Swagger decorators for documentation
- Separate DTOs for create, update, and response

```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
```

**Entities:**

- Use TypeORM decorators
- Define relationships clearly
- Add timestamps (createdAt, updatedAt)
- Use UUID for primary keys

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Exception Handling:**

- Use custom exception classes from `../common/exceptions`
- Available exceptions: `NotFoundException`, `ConflictException`,
  `BadRequestException`, `UnauthorizedException`, `ForbiddenException`,
  `InternalServerException`
- **Never throw exceptions in services - use ApiResponse.error() instead**
- Use HttpStatus enum for status codes
- All exceptions have `statusCode` and `message` properties

```typescript
import { HttpStatus } from '@nestjs/common';
import { NotFoundException, ConflictException } from '../common/exceptions';

// In services, return ApiResponse.error() instead of throwing
if (!user) {
  return ApiResponse.error(res, {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'User not found',
  });
}

if (existingUser) {
  return ApiResponse.error(res, {
    statusCode: HttpStatus.CONFLICT,
    message: 'Email already exists',
  });
}
```

### Error Handling, Logging & Monitoring - PRODUCTION READY

**This project implements comprehensive error infrastructure with standardized
error codes, structured logging, and error monitoring.**

#### Error Code Standardization

**File: `src/common/enums/error-codes.enum.ts`**

**70+ standardized error codes** organized by category with automatic HTTP
status mapping.

**Error Code Categories:**

- **AUTH** (1000-1099): Authentication & authorization errors
- **VAL** (2000-2099): Validation & input errors
- **DB** (3000-3099): Database & query errors
- **RES** (4000-4099): Resource not found & access errors
- **BUS** (5000-5099): Business logic violations
- **SYS** (6000-6099): System & internal errors
- **EXT** (7000-7099): External service errors
- **RATE** (8000-8099): Rate limiting errors
- **FILE** (9000-9099): File upload errors

**Usage Example:**

```typescript
import { ErrorCode } from '../common/enums';

throw new ValidationException('Email is required', {
  field: 'email',
  errorCode: ErrorCode.VAL_001,
});
```

#### Custom Exception Library - MANDATORY

**File: `src/common/exceptions/custom-exceptions.ts`**

**40+ custom exception classes** extending `BaseException` with automatic HTTP
status mapping and environment-aware messages.

**BaseException Structure:**

```typescript
export class BaseException extends Error {
  constructor(
    public readonly errorCode: ErrorCode,
    public readonly message: string,
    public readonly isOperational: boolean = true, // Expected errors
    public readonly metadata?: Record<string, unknown>,
  ) {}

  getHttpStatus(): HttpStatus; // Auto-mapped from error code
  getProductionMessage(): string; // Generic message for production
}
```

**Available Exception Classes:**

**Authentication Exceptions:**

- `InvalidCredentialsException` - Invalid email or password
- `UnauthorizedException` - Not authenticated
- `TokenExpiredException` - JWT token expired
- `TokenInvalidException` - Invalid JWT token
- `InsufficientPermissionsException` - Not authorized for action
- `AccountLockedException` - Account locked after failed attempts
- `AccountNotVerifiedException` - Email not verified
- `RefreshTokenExpiredException` - Refresh token expired

**Validation Exceptions:**

- `ValidationException` - General validation error
- `MissingRequiredFieldException` - Required field missing
- `InvalidFormatException` - Invalid data format
- `ValueOutOfRangeException` - Value outside allowed range
- `InvalidEmailException` - Invalid email format
- `WeakPasswordException` - Password doesn't meet requirements
- `DataIntegrityViolationException` - Data integrity constraint violated

**Resource Exceptions:**

- `ResourceNotFoundException` - Generic resource not found
- `UserNotFoundException` - User not found
- `RecordNotFoundException` - Database record not found
- `EndpointNotFoundException` - API endpoint not found
- `AccessDeniedException` - Access denied to resource
- `ResourceAlreadyExistsException` - Resource already exists

**Database Exceptions:**

- `DatabaseConnectionException` - Database connection failed
- `DatabaseQueryException` - Query execution failed
- `DuplicateEntryException` - Unique constraint violation
- `ForeignKeyConstraintException` - Foreign key constraint violated
- `DatabaseTimeoutException` - Query timeout
- `DatabaseTransactionException` - Transaction failed

**Business Logic Exceptions:**

- `BusinessRuleViolationException` - Business rule violated
- `InsufficientBalanceException` - Insufficient balance for operation
- `InvalidOperationException` - Operation not allowed in current state
- `StatusTransitionException` - Invalid status transition
- `DuplicateOperationException` - Operation already performed

**System Exceptions:**

- `InternalServerException` - Internal server error
- `ConfigurationException` - Configuration error
- `ServiceUnavailableException` - Service temporarily unavailable
- `TimeoutException` - Operation timeout
- `DependencyFailureException` - External dependency failed

**External Service Exceptions:**

- `ExternalServiceException` - External service error
- `ThirdPartyAPIException` - Third-party API call failed
- `PaymentGatewayException` - Payment gateway error
- `EmailServiceException` - Email service error
- `StorageServiceException` - Storage service error

**Rate Limiting Exceptions:**

- `RateLimitExceededException` - Rate limit exceeded
- `TooManyRequestsException` - Too many requests

**File Upload Exceptions:**

- `FileTooLargeException` - File size exceeds limit
- `InvalidFileTypeException` - File type not allowed
- `FileUploadException` - File upload failed
- `StorageQuotaExceededException` - Storage quota exceeded

**Exception Usage Patterns:**

```typescript
import {
  InvalidCredentialsException,
  ResourceNotFoundException,
  ValidationException,
  DuplicateEntryException,
  InsufficientBalanceException,
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

// Validation error with metadata
if (!dto.email || !dto.email.includes('@')) {
  throw new ValidationException('Invalid email format', {
    field: 'email',
    value: dto.email,
  });
}

// Business logic error
if (user.balance < amount) {
  throw new InsufficientBalanceException('withdraw', amount);
}

// Database error (operational - won't be sent to Sentry)
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

#### Winston Logger Service - MANDATORY

**File: `src/common/logger/logger.service.ts`**

**Structured logging with Winston** including multiple log levels, daily
rotation, and specialized logging methods.

**Log Levels:**

- **error**: Fatal errors, exceptions, system failures
- **warn**: Warnings, deprecated features, slow queries
- **info**: General information, startup, configuration
- **debug**: Debugging information, detailed flow
- **verbose**: Very detailed logs, trace-level

**Log Transports:**

1. **Console** - Colored output in dev, JSON in production
2. **error-%DATE%.log** - Error logs (30 days retention)
3. **combined-%DATE%.log** - All logs (14 days retention)
4. **access-%DATE%.log** - HTTP logs (7 days retention)

**Basic Logging Methods:**

```typescript
import { LoggerService } from './common/logger/logger.service';

@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerService) {}

  async create(dto: CreateUserDto, res: Response) {
    // Info log
    this.logger.log('Creating user', 'UsersService', {
      email: dto.email,
      correlationId: req.correlationId,
    });

    // Error log with stack trace
    this.logger.error('Failed to create user', error.stack, 'UsersService', {
      email: dto.email,
      errorCode: 'DB_001',
    });

    // Warning log
    this.logger.warn('Slow query detected', 'UsersService', {
      query: 'SELECT * FROM users',
      duration: 1500,
    });

    // Debug log
    this.logger.debug('Processing request', 'UsersService', {
      requestId: req.id,
    });
  }
}
```

**Specialized Logging Methods:**

```typescript
// HTTP Request logging
this.logger.logRequest({
  method: 'POST',
  url: '/api/v1/users',
  statusCode: 201,
  duration: 150,
  correlationId: 'abc-123',
  userId: 'user-id',
});

// Database query logging
this.logger.logQuery({
  query: 'SELECT * FROM users WHERE email = $1',
  duration: 45,
  correlationId: 'abc-123',
});

// External API logging
this.logger.logExternalAPI({
  service: 'PaymentGateway',
  method: 'POST',
  url: 'https://api.stripe.com/v1/charges',
  statusCode: 200,
  duration: 320,
  correlationId: 'abc-123',
});

// Event logging
this.logger.logEvent({
  eventName: 'UserRegistered',
  userId: 'user-id',
  email: 'user@example.com',
  correlationId: 'abc-123',
});

// Security event logging
this.logger.logSecurity({
  event: 'FailedLoginAttempt',
  userId: 'user-id',
  ip: '192.168.1.1',
  reason: 'Invalid password',
  correlationId: 'abc-123',
});

// Performance logging
this.logger.logPerformance({
  operation: 'BulkUserImport',
  duration: 5420,
  recordsProcessed: 1000,
  correlationId: 'abc-123',
});
```

#### Correlation IDs - AUTOMATIC

**File: `src/common/middleware/request-logging.middleware.ts`**

**Every HTTP request automatically receives a correlation ID** for tracking
across logs and errors.

**Correlation ID Flow:**

1. Middleware generates UUID v4 for each request
2. ID stored in `req.correlationId`
3. ID added to response header (`X-Correlation-Id`)
4. ID included in all logs for this request
5. ID included in error responses
6. ID sent to Sentry for error tracking

**Automatic Features:**

- Request logging (method, URL, IP, user agent)
- Response logging (status, size, duration)
- Slow request detection (>1000ms)
- Error logging (4xx, 5xx)
- Correlation ID in all logs

**Usage in Services:**

```typescript
async create(dto: CreateUserDto, @Req() req: Request) {
  const correlationId = req.correlationId; // UUID available on all requests

  this.logger.log('Creating user', 'UsersService', {
    correlationId, // Always include in logs
    email: dto.email,
  });

  // Correlation ID automatically included in error responses
  throw new ResourceNotFoundException('User', id);
}
```

#### Global Exception Filter - AUTOMATIC

**File: `src/common/filters/global-exception.filter.ts`**

**Catches ALL exceptions globally** and provides:

- Consistent error response format
- Automatic error logging with correlation IDs
- Sentry integration (only non-operational errors)
- Environment-aware messages (detailed in dev, generic in prod)
- Sensitive data sanitization

**Error Response Format:**

**Development:**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed: email must be a valid email",
  "timestamp": "2026-01-31T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "VAL_002",
  "details": { "field": "email" },
  "stack": "Error: Validation failed\n    at..."
}
```

**Production:**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Invalid input provided",
  "timestamp": "2026-01-31T10:30:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "errorCode": "VAL_002"
}
```

**Operational vs Non-Operational Errors:**

- **Operational errors** (expected business logic) - NOT sent to Sentry
- **Non-operational errors** (unexpected system errors) - Sent to Sentry
- All errors logged locally regardless

```typescript
// Operational - NOT sent to Sentry
throw new InvalidCredentialsException('email');
throw new ResourceNotFoundException('User', id);

// Non-operational - Sent to Sentry
throw new InternalServerException('Database connection failed');
throw new Error('Unexpected null pointer');
```

#### Sentry Error Monitoring - OPTIONAL

**File: `src/config/sentry.config.ts`**

**Production-grade error monitoring and performance tracking** with Sentry
integration.

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

**Features:**

- Error tracking with stack traces
- Performance monitoring (traces and profiles)
- Request/response breadcrumbs
- User context tracking
- Automatic operational error filtering
- Sensitive data sanitization

**Manual Error Capture:**

```typescript
import {
  captureSentryException,
  captureSentryMessage,
  startSentrySpan,
  addSentryBreadcrumb,
} from '../config/sentry.config';

// Capture exception with context
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

// Performance tracking
const span = startSentrySpan('BulkUserImport', 'task');
try {
  await importUsers(file);
  span.end();
} catch (error) {
  span.end();
  throw error;
}

// Add breadcrumb
addSentryBreadcrumb(
  'user',
  'User logged in',
  {
    userId: user.id,
    email: user.email,
  },
  'info',
);
```

#### Error Handling Best Practices - CRITICAL

**1. Use Appropriate Exception Classes:**

```typescript
// ✅ GOOD - Use specific exception
throw new ResourceNotFoundException('User', userId);

// ❌ BAD - Generic error
throw new Error('User not found');
```

**2. Include Metadata:**

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

**3. Log at Appropriate Levels:**

```typescript
// ✅ GOOD - Use correct levels
this.logger.error('Database connection failed', error.stack);
this.logger.warn('Slow query detected', 'Service', { duration: 1500 });
this.logger.info('User created successfully', 'Service', { userId });
this.logger.debug('Processing request', 'Service', { params });

// ❌ BAD - Everything is error
this.logger.error('User created');
```

**4. Always Use Correlation IDs:**

```typescript
// ✅ GOOD - Include correlation ID
this.logger.log('Operation completed', 'Service', {
  correlationId: req.correlationId,
  userId: user.id,
});

// ❌ BAD - No correlation ID
this.logger.log('Operation completed');
```

**5. Don't Log Sensitive Data:**

```typescript
// ✅ GOOD - Sanitize sensitive fields
this.logger.log('Login attempt', 'AuthService', {
  email: dto.email,
  // Don't log password
});

// ❌ BAD - Logging password
this.logger.log('Login attempt', 'AuthService', {
  email: dto.email,
  password: dto.password, // NEVER DO THIS
});
```

**6. Operational vs Non-Operational:**

```typescript
// ✅ GOOD - Operational (expected, don't send to Sentry)
throw new InvalidCredentialsException('email'); // isOperational = true

// ✅ GOOD - Non-operational (unexpected, send to Sentry)
throw new InternalServerException('Null pointer', false); // isOperational = false
```

**7. Complete Service Pattern:**

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggerService,
  ) {}

  async create(dto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
    const correlationId = req.correlationId;

    this.logger.log('Creating user', 'UsersService', {
      correlationId,
      email: dto.email,
    });

    // Check duplicate
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new DuplicateEntryException('User', 'email', dto.email);
    }

    // Validate
    if (dto.password.length < 8) {
      throw new WeakPasswordException('at least 8 characters');
    }

    try {
      const user = this.userRepository.create(dto);
      const saved = await this.userRepository.save(user);

      this.logger.log('User created successfully', 'UsersService', {
        correlationId,
        userId: saved.id,
      });

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: saved,
        message: 'User created successfully',
        meta: { user_id: saved.id, created_at: saved.createdAt },
      });
    } catch (error) {
      this.logger.error('Database error', error.stack, 'UsersService', {
        correlationId,
        email: dto.email,
      });

      throw new DatabaseQueryException('create user');
    }
  }
}
```

**For comprehensive documentation, see:
`server/docs/ERROR_HANDLING_AND_LOGGING.md`**

### JWT Authentication & Route Protection - MANDATORY

**All API routes must be secured with JWT authentication except public auth
endpoints.**

#### Protected Routes (Default)

- **ALWAYS apply `@UseGuards(JwtAuthGuard)` at controller level for protected
  resources**
- **Add `@ApiBearerAuth()` for Swagger documentation**
- **Use `@ApiUnauthorizedResponse()` decorator for all protected endpoints**

```typescript
import { UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiUnauthorizedResponse } from '../common/decorators';

@ApiTags('users')
@ApiBearerAuth() // Swagger: Show lock icon
@UseGuards(JwtAuthGuard) // Protect entire controller
@Controller('users')
export class UsersController {
  // All endpoints automatically protected

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiUnauthorizedResponse('/api/v1/users')
  async findAll(@Res() res: Response) {
    return this.service.findAll(res);
  }
}
```

#### Public Endpoints (Exceptions)

- **Login, Register, Password Reset, Email Verification - NO GUARD**
- **Health check endpoint - NO GUARD**

```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // Public endpoints - no guard
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    return this.authService.login(dto, res);
  }

  // Protected endpoints - add guard
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse('/api/v1/auth/logout')
  async logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
```

#### JWT Authentication Rules

1. ✅ **All CRUD endpoints require authentication** (Create, Read, Update,
   Delete)
2. ✅ **Apply guard at controller level** - protects all routes by default
3. ✅ **Add @ApiBearerAuth()** - shows lock icon in Swagger UI
4. ✅ **Use @ApiUnauthorizedResponse()** - documents 401 responses
5. ✅ **Access token expires in 15 minutes** - refresh via /auth/refresh
6. ✅ **Refresh token expires in 7 days** - must re-login after expiry
7. ✅ **Tokens blacklisted on logout** - prevents reuse

#### Token Usage in Controllers

```typescript
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/auth.interface';

@Get('profile')
@UseGuards(JwtAuthGuard)
async getProfile(@CurrentUser() user: JwtPayload) {
  // user.sub contains user ID
  // user.email contains user email
  return { userId: user.sub, email: user.email };
}
```

### API Response Standards

**Always use the ApiResponse utility class:**

```typescript
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../../common/utils/api-response.util';

// Success response
return ApiResponse.success(res, {
  statusCode: HttpStatus.OK,
  data: result,
  message: 'Operation successful',
  meta: { total: 10, page: 1, has_next: true, has_previous: true }, // Optional - use snake_case
});

// Error response (handled by exception filter)
return ApiResponse.error(res, {
  statusCode: HttpStatus.BAD_REQUEST,
  message: 'Validation failed',
  errors: validationErrors,
});
```

**Response Format:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Users fetched successfully",
  "data": { ... },
  "meta": { "total": 10 },
  "timestamp": "2024-01-27T10:30:00.000Z",
  "path": "/api/v1/users"
}
```

**Key Response Rules:**

1. Always use `HttpStatus` enum for status codes
2. Return data directly without case conversion
3. Always use `@Res()` decorator in controller methods
4. Return type must be `Promise<Response>`
5. Include descriptive messages
6. **Use snake_case for all meta field names** (e.g., `user_id`, `has_next`,
   `total_pages`, `created_at`)
7. Add meaningful meta information (user_id, timestamps, counts, pagination
   flags)
8. Wrap all controller methods in try-catch blocks
9. Log operations and errors with Logger

**Meta Field Naming Convention:**

- Use snake_case: `has_next`, `has_previous`, `total_pages`, `user_id`,
  `created_at`
- NOT camelCase: ~~hasNext~~, ~~hasPrevious~~, ~~totalPages~~, ~~userId~~,
  ~~createdAt~~

### API Versioning & Deprecation Management - PRODUCTION READY

**This project uses URI-based and header-based API versioning for backward
compatibility.**

#### API Versioning Strategy

**Versioning Methods:**

1. **URI Versioning (Primary):** `/api/v1/users`, `/api/v2/users`
2. **Header Versioning (Alternative):** `X-API-Version: 1` or
   `Accept-Version: 1`

**Configuration in `main.ts`:**

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});

// Support both URI and header versioning
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'X-API-Version',
});
```

#### API Versioning Decorators

**File: `src/common/decorators/versioning.decorators.ts`**

```typescript
import { SetMetadata } from '@nestjs/common';

// Mark endpoint with specific version
export const ApiVersion = (version: string | string[]) =>
  SetMetadata('version', version);

// Mark endpoint as deprecated with sunset date
export const ApiDeprecated = (sunsetDate: string, migrationGuide?: string) =>
  SetMetadata('deprecated', { sunsetDate, migrationGuide });

// Header-based versioning
export const ApiHeaderVersioning = (header: string = 'X-API-Version') =>
  SetMetadata('version-header', header);
```

**Usage Examples:**

```typescript
import { Controller, Get, Version } from '@nestjs/common';
import { ApiVersion, ApiDeprecated } from '../common/decorators';

@Controller('users')
export class UsersController {
  // V1 endpoint (deprecated)
  @Get()
  @Version('1')
  @ApiDeprecated('2026-12-31', 'https://api.example.com/docs/migration-guide')
  async findAllV1() {
    return this.usersService.findAllLegacy();
  }

  // V2 endpoint (current)
  @Get()
  @Version('2')
  async findAllV2() {
    return this.usersService.findAll();
  }

  // Support multiple versions
  @Get(':id')
  @Version(['1', '2'])
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

#### Versioning Interceptor

**File: `src/common/interceptors/versioning.interceptor.ts`**

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Versioning interceptor adds deprecation headers to responses
 * Warns clients about deprecated endpoints and sunset dates
 */
@Injectable()
export class VersioningInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();

    // Check if endpoint is deprecated
    const deprecated = this.reflector.get('deprecated', handler);

    if (deprecated) {
      response.setHeader('Deprecation', 'true');
      response.setHeader('Sunset', deprecated.sunsetDate);

      if (deprecated.migrationGuide) {
        response.setHeader(
          'Link',
          `<${deprecated.migrationGuide}>; rel="deprecation"`,
        );
      }
    }

    return next.handle();
  }
}
```

**Register Globally in `app.module.ts`:**

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { VersioningInterceptor } from './common/interceptors/versioning.interceptor';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: VersioningInterceptor,
    },
  ],
})
export class AppModule {}
```

#### Versioning Best Practices

1. ✅ **Use URI versioning by default** - Most explicit and cache-friendly
2. ✅ **Support header versioning** - For clients preferring headers
3. ✅ **Deprecate before removing** - Give clients 6-12 months notice
4. ✅ **Document breaking changes** - Clear migration guides
5. ✅ **Add deprecation headers** - Sunset date, deprecation warning, migration
   link
6. ✅ **Version major changes only** - Don't version minor bug fixes
7. ✅ **Test all versions** - Ensure backward compatibility
8. ❌ **Never remove versions abruptly** - Always deprecate first

#### Deprecation Response Headers

**Deprecated Endpoint Response:**

```
HTTP/1.1 200 OK
Deprecation: true
Sunset: Wed, 31 Dec 2026 23:59:59 GMT
Link: <https://api.example.com/docs/migration-guide>; rel="deprecation"
```

### Environment Configuration Standards - PRODUCTION READY

**All external configuration must be stored in environment variables.**

#### Environment Variables Pattern

**Backend Environment Variables (`.env`):**

```env
# Application
NODE_ENV=development
PORT=3001
API_URL_LOCAL=http://localhost:3001
API_URL_PRODUCTION=https://api.example.com

# Database
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=your_database

# JWT Authentication
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-change-this
JWT_REFRESH_EXPIRES_IN=7d

# Email Service
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@example.com

# API Contact Information
API_CONTACT_NAME=API Support
API_CONTACT_URL=https://example.com/support
API_CONTACT_EMAIL=support@example.com

# GraphQL Configuration
GRAPHQL_PLAYGROUND=true
GRAPHQL_INTROSPECTION=true
GRAPHQL_DEBUG=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
RATE_LIMIT_STRICT_TTL=60000
RATE_LIMIT_STRICT_MAX=10
RATE_LIMIT_AUTH_TTL=900000
RATE_LIMIT_AUTH_MAX=5

# Cache
CACHE_TTL=60000
CACHE_MAX_ITEMS=100

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Frontend Environment Variables (`.env.local`):**

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
```

#### Environment Validation

**File: `src/config/env.validation.ts`**

```typescript
import { plainToInstance } from 'class-transformer';
import { IsString, IsNumber, IsBoolean, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsBoolean()
  RATE_LIMIT_ENABLED: boolean;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
```

**Load in `app.module.ts`:**

```typescript
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: '.env',
    }),
  ],
})
export class AppModule {}
```

#### Using Environment Variables

**In Services:**

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}

  someMethod() {
    const apiUrl = this.configService.get<string>('API_URL_LOCAL');
    const port = this.configService.get<number>('PORT', 3001); // with default
    const isProduction = this.configService.get('NODE_ENV') === 'production';
  }
}
```

**In Config Files:**

```typescript
import { ConfigService } from '@nestjs/config';

export const someConfig = (configService: ConfigService) => ({
  enabled: configService.get<boolean>('FEATURE_ENABLED', true),
  timeout: configService.get<number>('TIMEOUT', 5000),
  apiKey: configService.get<string>('API_KEY'),
});
```

#### Environment Best Practices

1. ✅ **Never commit `.env` files** - Add to `.gitignore`
2. ✅ **Provide `.env.example`** - Document all required variables
3. ✅ **Validate environment on startup** - Use env.validation.ts
4. ✅ **Use ConfigService** - Never access process.env directly
5. ✅ **Provide defaults** - For non-critical variables
6. ✅ **Use typed getters** - `get<number>`, `get<string>`, `get<boolean>`
7. ✅ **Document all variables** - In README and .env.example
8. ❌ **Never hardcode secrets** - Always use environment variables

### Swagger/OpenAPI Documentation Standards

**Always add comprehensive Swagger documentation to all controller endpoints:**

```typescript
import { ApiTags, ApiOperation, ApiResponse as ApiResponseDecorator, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user with email, first name, last name, and password.'
  })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'User has been successfully created.',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message: 'User created successfully',
        data: {
          id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: '2026-01-27T10:23:22.983Z',
          updatedAt: '2026-01-27T10:23:22.983Z',
        },
        meta: {
          user_id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          created_at: '2026-01-27T10:23:22.983Z',
        },
        timestamp: '2026-01-27T10:23:22.997Z',
        path: '/api/v1/users',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Validation failed.',
    schema: {
      example: {
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        errors: ['Email is required'],
        timestamp: '2026-01-27T10:23:22.997Z',
        path: '/api/v1/users',
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response): Promise<Response> {
    return this.usersService.create(createUserDto, res);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description: 'Retrieves a paginated list of users.'
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Return all users with pagination.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Users fetched successfully',
        data: [...],
        meta: {
          total: 25,
          count: 10,
          page: 2,
          limit: 10,
          total_pages: 3,
          has_next: true,
          has_previous: true,
        },
        timestamp: '2026-01-27T10:28:36.014Z',
        path: '/api/v1/users',
      },
    },
  })
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res: Response
  ): Promise<Response> {
    return this.usersService.findAll(parseInt(page), parseInt(limit), res);
  }
}
```

**Swagger Documentation Rules:**

1. **@ApiTags()** - Group related endpoints (e.g., 'users', 'auth', 'posts')
2. **@ApiOperation()** - Add summary and detailed description for each endpoint
3. **@ApiResponseDecorator()** - Document ALL possible response status codes
   with examples
4. **@ApiParam()** - Document path parameters with name, description, and
   example
5. **@ApiQuery()** - Document query parameters with type, required flag,
   description, and example
6. **schema.example** - ALWAYS include realistic response examples matching
   actual API response format
7. Include both success and error response examples
8. Use snake_case in all meta fields within examples
9. Response examples must include: status, statusCode, message, data, meta (if
   applicable), timestamp, path
10. Error examples must show proper error structure with message and optional
    errors array

### Caching Standards

**NestJS Cache Manager:**

- Use `@nestjs/cache-manager` for caching
- Cache configuration in `config/cache.config.ts`
- Inject `CACHE_MANAGER` in services that need caching
- Always invalidate cache after create, update, delete operations

**Caching Best Practices:**

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  private readonly CACHE_PREFIX = 'user';
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async findOne(id: string): Promise<User> {
    // Check cache first
    const cacheKey = `${this.CACHE_PREFIX}_${id}`;
    const cachedUser = await this.cacheManager.get<User>(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    // Fetch from database
    const user = await this.repository.findOne({ where: { id } });

    // Store in cache
    await this.cacheManager.set(cacheKey, user, this.CACHE_TTL);

    return user;
  }

  async update(id: string, data: UpdateDto): Promise<User> {
    const updated = await this.repository.save({ id, ...data });

    // Invalidate cache after update
    await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
    await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);

    return updated;
  }
}
```

**Cache Key Conventions:**

- Use descriptive prefixes: `user_`, `post_`, `comment_`
- Include entity ID: `user_123`, `post_456`
- Use list suffix for collections: `user_list`, `post_list`
- Include query parameters in key for filtered lists: `user_list_active`

**Cache Invalidation Rules:**

- Always invalidate cache after CREATE operations
- Always invalidate cache after UPDATE operations
- Always invalidate cache after DELETE operations
- Invalidate both individual item and list caches
- Log cache operations for debugging

### Database Standards - COMPREHENSIVE

**Complete guide**: See `server/docs/DATABASE_FEATURES.md` for comprehensive
documentation.

#### Migrations - ALWAYS USE FOR SCHEMA CHANGES

**Migration Scripts** (`server/src/scripts/`):

- `generate-migration.sh` - Auto-detect entity changes and generate migration
- `create-migration.sh` - Create empty migration template for custom SQL
- `run-migrations.sh` - Interactive migration runner with confirmation
- `rollback-migration.sh` - Rollback last migration (use with caution)

**Migration Best Practices:**

```bash
# Generate migration from entity changes
cd server
./src/scripts/generate-migration.sh AddUserRoles

# Create empty migration for custom changes
./src/scripts/create-migration.sh AddCustomIndexes

# Run pending migrations
./src/scripts/run-migrations.sh

# Rollback last migration (data loss possible)
./src/scripts/rollback-migration.sh
```

**Migration Rules:**

1. ✅ **ALWAYS create migrations for schema changes** - Never modify database
   manually
2. ✅ **Test rollback before deploying** - Ensure DOWN method works
3. ✅ **Keep migrations small** - One logical change per migration
4. ✅ **Never modify old migrations** - Create new ones to fix issues
5. ✅ **Backup before rollback** - Rollback can cause data loss
6. ❌ **NEVER use synchronize: true in production**

#### Database Seeding - FOR DEVELOPMENT/TESTING

**Seeder System** (`server/src/database/seeders/`):

- Complete seeding framework with interface, service, module, CLI
- Users seeder included - adds 4 test users (1 admin, 2 active, 1 inactive)
- CLI commands: `yarn seed`, `yarn seed:rollback`, `yarn seed:clear`

**Creating Custom Seeders:**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { Seeder } from './seeder.interface';

@Injectable()
export class PostsSeeder implements Seeder {
  private readonly logger = new Logger(PostsSeeder.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async run(): Promise<void> {
    this.logger.log('Seeding posts...');

    const posts = [
      { title: 'First Post', content: 'Content here' },
      { title: 'Second Post', content: 'More content' },
    ];

    for (const postData of posts) {
      // Check if already exists to prevent duplicates
      const existing = await this.postsRepository.findOne({
        where: { title: postData.title },
      });

      if (!existing) {
        await this.postsRepository.save(postData);
        this.logger.log(`Created post: ${postData.title}`);
      }
    }

    this.logger.log('Posts seeded successfully');
  }

  async rollback(): Promise<void> {
    this.logger.log('Rolling back posts...');
    await this.postsRepository.delete({});
    this.logger.log('Posts rolled back successfully');
  }
}
```

**Seeder Rules:**

1. ✅ **Check for existing data** - Don't create duplicates
2. ✅ **Handle dependencies** - Run dependent seeders in correct order
3. ✅ **Make idempotent** - Can run multiple times safely
4. ✅ **Use transactions** - Rollback on error
5. ❌ **NEVER run seeders in production**

#### Query Performance & Logging

**Custom Database Logger** (`server/src/config/database-logger.config.ts`):

- Automatically detects slow queries (>100ms threshold)
- Provides optimization suggestions (add WHERE, avoid SELECT \*, add LIMIT)
- Colorized console output in development
- Integrated in `app.module.ts` for non-production environments

**Query Optimization Best Practices:**

```typescript
// ❌ BAD - N+1 query problem
const users = await userRepository.find();
for (const user of users) {
  const posts = await postRepository.find({ where: { userId: user.id } });
}

// ✅ GOOD - Single query with eager loading
const users = await userRepository.find({ relations: ['posts'] });

// ❌ BAD - Fetches all columns
const users = await userRepository.find();

// ✅ GOOD - Select only needed columns
const users = await userRepository.find({
  select: ['id', 'email', 'firstName'],
});

// ✅ ALWAYS use pagination for large datasets
const [users, total] = await userRepository.findAndCount({
  skip: (page - 1) * limit,
  take: limit,
});

// ✅ ALWAYS add indexes for frequently queried columns
@Entity('users')
export class User {
  @Index()
  @Column()
  email: string;

  @Index()
  @Column()
  firstName: string;
}
```

#### Data Sanitization & Security - AUTOMATIC

**Sanitization Middleware**
(`server/src/common/middleware/sanitization.middleware.ts`):

- Applied globally in `main.ts` - sanitizes all incoming requests
- XSS prevention: Removes `<script>`, `<iframe>`, event handlers
- SQL injection prevention: Removes SQL keywords (`SELECT`, `INSERT`, `DROP`,
  etc.)
- JavaScript protocol removal: Removes `javascript:`, `data:` protocols
- Recursive sanitization: Handles nested objects and arrays

**Custom Validation Decorators**
(`server/src/common/decorators/validation.decorators.ts`):

```typescript
import {
  IsStrongPassword,
  NoSqlInjection,
  NoXss,
  SafeString,
  IsValidUUID,
  IsAlphanumericWithSpaces,
} from '../common/decorators/validation.decorators';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword() // 8+ chars, uppercase, lowercase, number, special char
  @IsNotEmpty()
  password: string;

  @SafeString() // Combines NoSqlInjection + NoXss
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @NoXss() // Prevents XSS attacks
  @IsOptional()
  @MaxLength(500)
  bio?: string;
}

export class FindUserDto {
  @IsValidUUID() // Validates UUID v4 format
  id: string;
}
```

**Validation Decorator Library:**

- `@IsStrongPassword()` - 8+ chars, uppercase, lowercase, number, special char
- `@NoSqlInjection()` - Prevents SQL injection patterns
- `@NoXss()` - Prevents XSS attack patterns
- `@SafeString()` - Combines NoSqlInjection + NoXss
- `@IsValidUUID()` - Validates UUID v4 format
- `@IsAlphanumericWithSpaces()` - Only alphanumeric + spaces

**Security Rules:**

1. ✅ **Always use parameterized queries** - TypeORM handles escaping
2. ✅ **Validate at DTO level** - Use class-validator decorators
3. ✅ **Sanitization is automatic** - Middleware handles all requests
4. ✅ **Never trust user input** - Always validate and sanitize
5. ✅ **Use HTTPS in production** - Protect data in transit
6. ✅ **Hash passwords with bcrypt** - Never store plain text passwords

### GraphQL Support - PRODUCTION READY

**This project uses GraphQL alongside REST API for flexible data querying.**

#### GraphQL Stack & Configuration

**Compatible Versions (CRITICAL):**

```json
{
  "@apollo/server": "4.11.2",
  "@nestjs/apollo": "12.2.0",
  "@nestjs/graphql": "12.2.0",
  "graphql": "16.12.0",
  "ts-morph": "27.0.2"
}
```

**Why these versions?**

- Apollo Server v4 doesn't require `@as-integrations/express5` package
- NestJS Apollo/GraphQL v12 is compatible with Apollo Server v4
- ts-morph is required for auto-generating TypeScript types from .graphql
  schemas
- ❌ DO NOT upgrade to Apollo Server v5 (requires additional express
  integration)

#### GraphQL Architecture - Schema-First Design

**File Structure:**

```
server/src/graphql/
  graphql.config.ts        # Apollo Server configuration
  graphql.module.ts        # GraphQL module setup
  schema/                  # GraphQL schema definitions (.graphql files)
    user.graphql           # User type, queries, mutations
    post.graphql           # Example: Post schema
  resolvers/               # GraphQL resolvers
    user.resolver.ts       # User query/mutation handlers
  guards/                  # GraphQL-specific guards
    gql-auth.guard.ts      # JWT authentication for GraphQL
```

**Schema-First Approach:**

1. **Write .graphql schema files** - Define types, queries, mutations
2. **Auto-generate TypeScript types** - GraphQL module generates types
   automatically
3. **Implement resolvers** - Use generated types for type safety
4. **Use existing services** - Reuse REST service logic in resolvers

#### GraphQL Configuration (`graphql.config.ts`)

```typescript
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { GraphQLError } from 'graphql';

export const graphqlConfig = (
  configService: ConfigService,
): ApolloDriverConfig => ({
  driver: ApolloDriver,

  // Schema-first: auto-generate from .graphql files
  typePaths: ['./**/*.graphql'],

  // Auto-generate TypeScript types
  definitions: {
    path: join(process.cwd(), 'src/graphql/graphql.schema.ts'),
    outputAs: 'class',
    emitTypenameField: true,
  },

  // GraphQL Playground (development only)
  playground: configService.get('NODE_ENV') === 'development',

  // Auto-generate schema file
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
  sortSchema: true,

  // Context: Inject request for authentication
  context: ({ req, res }: { req: Request; res: Response }) => ({
    req,
    res,
  }),

  // Custom error formatting
  formatError: (error: GraphQLError) => ({
    message: error.message,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    timestamp: new Date().toISOString(),
  }),
});
```

**Key Configuration Points:**

- `typePaths`: Where to find .graphql schema files
- `definitions.path`: Where to generate TypeScript types
- `playground`: Enable GraphQL Playground in development
- `context`: Inject Express request/response for guards
- `formatError`: Consistent error format

#### GraphQL Schema Pattern (`.graphql`)

**Example: `user.graphql`**

```graphql
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String
  isActive: Boolean!
  createdAt: String!
  updatedAt: String!
}

type PaginatedUsers {
  users: [User!]!
  total: Int!
  page: Int!
  limit: Int!
  hasNext: Boolean!
  hasPrevious: Boolean!
}

type Query {
  # Get all users with pagination
  users(page: Int, limit: Int): PaginatedUsers!

  # Get single user by ID
  user(id: ID!): User

  # Search users by name or email
  searchUsers(query: String!): [User!]!
}

type Mutation {
  # Create new user
  createUser(
    email: String!
    firstName: String!
    lastName: String
    password: String!
  ): User!

  # Update existing user
  updateUser(id: ID!, email: String, firstName: String, lastName: String): User!

  # Delete user (soft delete)
  deleteUser(id: ID!): Boolean!

  # Toggle user active status
  toggleUserStatus(id: ID!): User!
}

type Subscription {
  # Real-time user creation events
  userCreated: User!

  # Real-time user update events
  userUpdated: User!
}
```

**Schema Best Practices:**

1. **Use descriptive field names** - Clear and self-documenting
2. **Add comments** - Explain complex types and fields
3. **Use proper types** - String, Int, Boolean, Float, ID
4. **Mark required fields** - Use `!` for non-nullable fields
5. **Define input types** - For complex mutation inputs
6. **Include pagination** - For list queries
7. **Consider subscriptions** - For real-time updates

#### GraphQL Resolver Pattern

**Example: `user.resolver.ts`**

```typescript
import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UseGuards, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { UsersService } from '../../users/users.service';
import { CreateUserDto, UpdateUserDto } from '../../users/dto';
import { User } from '../../users/entities/user.entity';
import { isSuccessResponse } from '../../common/utils';

/**
 * GraphQL resolver for user operations
 * Handles queries and mutations for user management
 */
@Resolver('User')
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Query: Get all users with pagination
   * Protected: Requires JWT authentication
   */
  @Query('users')
  @UseGuards(GqlAuthGuard)
  async getUsers(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
  ) {
    // Create mock response object for service
    const mockRes = {
      status: () => mockRes,
      send: (data: unknown) => data,
    } as unknown as Response;

    const response = await this.usersService.findAll(page, limit, mockRes);

    if (isSuccessResponse(response)) {
      return {
        users: response.data,
        total: response.meta?.total || 0,
        page: response.meta?.page || page,
        limit: response.meta?.limit || limit,
        hasNext: response.meta?.has_next || false,
        hasPrevious: response.meta?.has_previous || false,
      };
    }

    throw new Error(response.message);
  }

  /**
   * Query: Get user by ID
   * Protected: Requires JWT authentication
   */
  @Query('user')
  @UseGuards(GqlAuthGuard)
  async getUser(@Args('id', { type: () => ID }) id: string) {
    const mockRes = {
      status: () => mockRes,
      send: (data: unknown) => data,
    } as unknown as Response;

    const response = await this.usersService.findOne(id, mockRes);

    if (isSuccessResponse(response)) {
      return response.data;
    }

    throw new Error(response.message);
  }

  /**
   * Mutation: Create new user
   * Protected: Requires JWT authentication
   */
  @Mutation('createUser')
  @UseGuards(GqlAuthGuard)
  async createUser(
    @Args('email') email: string,
    @Args('firstName') firstName: string,
    @Args('lastName', { nullable: true }) lastName: string,
    @Args('password') password: string,
  ) {
    const mockRes = {
      status: () => mockRes,
      send: (data: unknown) => data,
    } as unknown as Response;

    const createDto: CreateUserDto = { email, firstName, lastName, password };
    const response = await this.usersService.create(createDto, mockRes);

    if (isSuccessResponse(response)) {
      return response.data;
    }

    throw new Error(response.message);
  }

  /**
   * Mutation: Update user
   * Protected: Requires JWT authentication
   */
  @Mutation('updateUser')
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('email', { nullable: true }) email?: string,
    @Args('firstName', { nullable: true }) firstName?: string,
    @Args('lastName', { nullable: true }) lastName?: string,
  ) {
    const mockRes = {
      status: () => mockRes,
      send: (data: unknown) => data,
    } as unknown as Response;

    const updateDto: UpdateUserDto = { email, firstName, lastName };
    const response = await this.usersService.update(id, updateDto, mockRes);

    if (isSuccessResponse(response)) {
      return response.data;
    }

    throw new Error(response.message);
  }
}
```

**Resolver Best Practices:**

1. **Reuse existing services** - Don't duplicate business logic
2. **Use GqlAuthGuard** - Protect queries/mutations requiring authentication
3. **Create mock Response object** - Services expect Express Response
4. **Type all arguments** - Use @Args with proper types
5. **Handle errors properly** - Throw GraphQLError for consistent error format
6. **Use isSuccessResponse()** - Check service response type
7. **Add JSDoc comments** - Document all queries and mutations

#### GraphQL Authentication Guard

**File: `gql-auth.guard.ts`**

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * JWT authentication guard for GraphQL
 * Extracts request from GraphQL context and applies JWT validation
 */
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  /**
   * Extract request from GraphQL execution context
   * Converts GraphQL context to HTTP context for JWT strategy
   */
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

**Usage in Resolvers:**

```typescript
@Query('protectedQuery')
@UseGuards(GqlAuthGuard)
async protectedQuery() {
  // Only accessible with valid JWT token
}
```

#### GraphQL Module Setup

**File: `graphql.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { graphqlConfig } from './graphql.config';
import { UserResolver } from './resolvers/user.resolver';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: graphqlConfig,
      inject: [ConfigService],
    }),
    UsersModule, // Import modules needed by resolvers
  ],
  providers: [UserResolver],
})
export class GraphqlAppModule {}
```

#### Integrating GraphQL in App Module

**File: `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { GraphqlAppModule } from './graphql/graphql.module';

@Module({
  imports: [
    // ... other modules
    GraphqlAppModule, // Add GraphQL module
  ],
})
export class AppModule {}
```

#### GraphQL Playground Access

**Development URL:** `http://localhost:3001/graphql`

**Example Query:**

```graphql
query GetUsers {
  users(page: 1, limit: 10) {
    users {
      id
      email
      firstName
      lastName
      isActive
    }
    total
    hasNext
    hasPrevious
  }
}
```

**Example Mutation:**

```graphql
mutation CreateUser {
  createUser(
    email: "test@example.com"
    firstName: "John"
    lastName: "Doe"
    password: "SecurePass123!"
  ) {
    id
    email
    firstName
  }
}
```

**Authentication in Playground:** Add JWT token in HTTP Headers:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

#### GraphQL + REST Coexistence

**Both APIs work simultaneously:**

- **REST API:** `http://localhost:3001/api/v1/users`
- **GraphQL API:** `http://localhost:3001/graphql`

**Use REST for:**

- ✅ Simple CRUD operations
- ✅ File uploads
- ✅ Standard HTTP caching
- ✅ Public APIs

**Use GraphQL for:**

- ✅ Complex data relationships
- ✅ Flexible data fetching (avoid over-fetching)
- ✅ Real-time subscriptions
- ✅ Mobile/frontend apps with varying data needs

#### GraphQL Environment Variables

**Required in `.env`:**

```env
# GraphQL Configuration
GRAPHQL_PLAYGROUND=true  # Enable playground in development
GRAPHQL_INTROSPECTION=true  # Enable schema introspection
GRAPHQL_DEBUG=true  # Enable debug mode
```

#### GraphQL Best Practices & Rules

1. ✅ **Schema-first design** - Write .graphql files first, then implement
   resolvers
2. ✅ **Auto-generate types** - Let GraphQL module generate TypeScript types
3. ✅ **Reuse REST services** - Don't duplicate business logic in resolvers
4. ✅ **Use GqlAuthGuard** - Protect all queries/mutations requiring
   authentication
5. ✅ **Handle errors** - Throw GraphQLError with proper error codes
6. ✅ **Add pagination** - For all list queries
7. ✅ **Use nullable types wisely** - Mark optional fields with nullable: true
8. ✅ **Document schema** - Add comments to .graphql files
9. ✅ **Version GraphQL schema** - Use deprecation for breaking changes
10. ✅ **Monitor performance** - Log slow queries

#### GraphQL Common Issues & Solutions

**Issue: "Cannot find module 'ts-morph'"**

- **Solution:** Install ts-morph as dev dependency: `yarn add -D ts-morph`
- **Reason:** Required for auto-generating TypeScript types from .graphql
  schemas

**Issue: "Cannot find module '@as-integrations/express5'"**

- **Solution:** Downgrade to Apollo Server v4.11.2, @nestjs/apollo@12.2.0,
  @nestjs/graphql@12.2.0
- **Reason:** Apollo Server v5 requires additional express integration, v4
  doesn't

**Issue: "Only one plugin can implement renderLandingPage"**

- **Solution:** Remove `ApolloServerPluginLandingPageLocalDefault` from config
- **Reason:** `playground: true` already provides GraphQL Playground UI

**Issue: "Cannot read property 'req' of undefined in GqlAuthGuard"**

- **Solution:** Ensure context function in graphql.config.ts returns
  `{ req, res }`
- **Reason:** GqlAuthGuard needs request object for JWT extraction

### API Rate Limiting - PRODUCTION READY

**Protect your API from abuse with IP-based and user-based rate limiting.**

#### Rate Limiting Stack

**Package:** `@nestjs/throttler@6.5.0`

**Features:**

- Global rate limiting (default: 100 requests/minute)
- IP-based rate limiting for unauthenticated users
- User-based rate limiting for authenticated users
- Custom decorators for different rate limit tiers
- RFC 6585 compliant headers (X-RateLimit-\*)
- Automatic Retry-After headers on 429 responses

#### Rate Limiting Architecture

**File Structure:**

```
server/src/
  config/
    rate-limit.config.ts           # Throttler configuration
  common/
    decorators/
      rate-limit.decorator.ts      # Custom rate limit decorators
    guards/
      throttler.guard.ts           # Custom throttler guard with headers
```

#### Rate Limit Configuration (`rate-limit.config.ts`)

```typescript
import { ConfigService } from '@nestjs/config';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimitConfig = (
  configService: ConfigService,
): ThrottlerModuleOptions => {
  const enabled = configService.get<string>('RATE_LIMIT_ENABLED') !== 'false';

  if (!enabled) {
    return { throttlers: [] };
  }

  return {
    throttlers: [
      {
        name: 'default',
        ttl: configService.get<number>('RATE_LIMIT_TTL', 60000), // 1 minute
        limit: configService.get<number>('RATE_LIMIT_MAX', 100), // 100 requests
      },
      {
        name: 'strict',
        ttl: configService.get<number>('RATE_LIMIT_STRICT_TTL', 60000),
        limit: configService.get<number>('RATE_LIMIT_STRICT_MAX', 10), // 10 requests/min
      },
      {
        name: 'auth',
        ttl: configService.get<number>('RATE_LIMIT_AUTH_TTL', 900000), // 15 minutes
        limit: configService.get<number>('RATE_LIMIT_AUTH_MAX', 5), // 5 attempts
      },
    ],
  };
};
```

**Configuration Tiers:**

- **default:** 100 requests/minute - General API endpoints
- **strict:** 10 requests/minute - Sensitive operations
- **auth:** 5 requests/15 minutes - Login/register endpoints

#### Custom Rate Limit Decorators (`rate-limit.decorator.ts`)

**Available Decorators:**

```typescript
import { SetMetadata } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

// 1. Custom rate limit with message
export const RateLimit = (ttl: number, limit: number, message?: string) => {
  return SetMetadata('rate-limit', {
    throttlers: [{ name: 'custom', ttl, limit }],
    message: message || 'Too many requests',
  });
};

// 2. Authentication endpoints (strict)
export const AuthRateLimit = () =>
  Throttle([{ name: 'auth', ttl: 900000, limit: 5 }]);

// 3. Strict rate limit (sensitive operations)
export const StrictRateLimit = () =>
  Throttle([{ name: 'strict', ttl: 60000, limit: 10 }]);

// 4. Public endpoints (relaxed)
export const PublicRateLimit = () =>
  Throttle([{ name: 'default', ttl: 60000, limit: 100 }]);

// 5. Skip rate limiting (use sparingly)
export const SkipRateLimit = () => SkipThrottle();

// 6. Per-user rate limit
export const UserRateLimit = (ttl: number, limit: number) =>
  SetMetadata('user-rate-limit', { ttl, limit });
```

**Decorator Usage Examples:**

```typescript
import {
  RateLimit,
  AuthRateLimit,
  StrictRateLimit,
  PublicRateLimit,
  SkipRateLimit,
} from '../common/decorators';

@Controller('auth')
export class AuthController {
  // Login: 5 attempts per 15 minutes
  @Post('login')
  @AuthRateLimit()
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Register: 5 attempts per 15 minutes
  @Post('register')
  @AuthRateLimit()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // Refresh: 10 attempts per minute
  @Post('refresh')
  @StrictRateLimit()
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto);
  }

  // Logout: No rate limit
  @Post('logout')
  @SkipRateLimit()
  async logout() {
    return this.authService.logout();
  }

  // Password reset: Custom limit
  @Post('reset-password')
  @RateLimit(300000, 3, 'Too many password reset attempts')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}

@Controller('users')
export class UsersController {
  // Public endpoint: 100 requests/minute
  @Get()
  @PublicRateLimit()
  async findAll() {
    return this.usersService.findAll();
  }

  // Sensitive operation: 10 requests/minute
  @Delete(':id')
  @StrictRateLimit()
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

#### Custom Throttler Guard (`throttler.guard.ts`)

**Features:**

- IP-based tracking for unauthenticated users
- User-based tracking for authenticated users (by user ID)
- RFC 6585 compliant headers
- Retry-After header on 429 responses

```typescript
import {
  Injectable,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';

/**
 * Custom throttler guard with enhanced features:
 * - IP-based rate limiting for unauthenticated users
 * - User-based rate limiting for authenticated users
 * - RFC 6585 compliant rate limit headers
 * - Retry-After header on 429 responses
 */
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * Override canActivate to add custom headers
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    try {
      const canActivate = await super.canActivate(context);

      // Add rate limit headers
      const throttlerLimit = this.getThrottlerLimit(context);
      const throttlerRemaining = this.getThrottlerRemaining(context);
      const throttlerReset = this.getThrottlerReset(context);

      response.setHeader('X-RateLimit-Limit', throttlerLimit);
      response.setHeader('X-RateLimit-Remaining', throttlerRemaining);
      response.setHeader('X-RateLimit-Reset', throttlerReset);

      return canActivate;
    } catch (error) {
      // Add Retry-After header on rate limit exceeded
      const retryAfter = this.getRetryAfter(context);
      response.setHeader('Retry-After', retryAfter);

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Get tracker key: user ID for authenticated, IP for unauthenticated
   */
  protected getTracker(request: Request): Promise<string> {
    // If user is authenticated, use user ID
    if (request.user && (request.user as { sub?: string }).sub) {
      return Promise.resolve(`user:${(request.user as { sub: string }).sub}`);
    }

    // Otherwise, use IP address
    const ip =
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.socket.remoteAddress ||
      'unknown';
    return Promise.resolve(`ip:${ip}`);
  }
}
```

**Key Features:**

1. **Smart Tracking:** Uses user ID when authenticated, IP when not
2. **Rate Limit Headers:** X-RateLimit-Limit, X-RateLimit-Remaining,
   X-RateLimit-Reset
3. **Retry-After Header:** Tells client when to retry after 429 error
4. **Consistent Error Format:** Matches ApiResponse error structure

#### Integrating Rate Limiting in App Module

**File: `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { rateLimitConfig } from './config/rate-limit.config';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    // Configure throttler module
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: rateLimitConfig,
      inject: [ConfigService],
    }),
    // ... other modules
  ],
  providers: [
    // Register custom throttler guard globally
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### Rate Limiting Environment Variables

**Required in `.env`:**

```env
# Rate Limiting Configuration
RATE_LIMIT_ENABLED=true            # Enable/disable rate limiting
RATE_LIMIT_TTL=60000               # Default TTL in milliseconds (1 minute)
RATE_LIMIT_MAX=100                 # Default max requests per TTL
RATE_LIMIT_STRICT_TTL=60000        # Strict TTL (1 minute)
RATE_LIMIT_STRICT_MAX=10           # Strict max requests
RATE_LIMIT_AUTH_TTL=900000         # Auth TTL (15 minutes)
RATE_LIMIT_AUTH_MAX=5              # Auth max attempts
```

#### Rate Limit Response Headers

**Success Response (within limit):**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706371200
```

**Error Response (limit exceeded):**

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706371200
Retry-After: 45
```

**Error Body:**

```json
{
  "statusCode": 429,
  "message": "Too many requests, please try again later",
  "error": "Too Many Requests"
}
```

#### Rate Limiting Best Practices & Rules

1. ✅ **Use appropriate tier** - Auth endpoints use strict limits, public
   endpoints use relaxed
2. ✅ **Skip rate limiting carefully** - Only skip for health checks, webhooks
   from trusted sources
3. ✅ **Monitor rate limit hits** - Log when users hit rate limits
4. ✅ **Clear error messages** - Tell users why they're rate limited
5. ✅ **Use custom messages** - @RateLimit decorator accepts custom error
   message
6. ✅ **Expose headers in CORS** - Add rate limit headers to CORS exposedHeaders
7. ✅ **Test rate limiting** - Write tests for rate limit scenarios
8. ✅ **Document limits** - Include rate limits in API documentation
9. ✅ **Use user-based tracking** - More accurate for authenticated users
10. ❌ **Never disable globally** - Keep rate limiting enabled in production

#### Rate Limiting + CORS Configuration

**File: `main.ts`**

```typescript
app.enableCors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
  ],
});
```

#### Rate Limiting Common Patterns

**Pattern 1: Protect Auth Endpoints**

```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @AuthRateLimit() // 5 attempts per 15 min
  async login() {}

  @Post('register')
  @AuthRateLimit() // 5 attempts per 15 min
  async register() {}
}
```

**Pattern 2: Protect Sensitive Operations**

```typescript
@Controller('users')
export class UsersController {
  @Delete(':id')
  @StrictRateLimit() // 10 per minute
  async remove() {}

  @Post('bulk-delete')
  @StrictRateLimit() // 10 per minute
  async bulkDelete() {}
}
```

**Pattern 3: Public Endpoints**

```typescript
@Controller('public')
export class PublicController {
  @Get('health')
  @SkipRateLimit() // No limit
  async health() {}

  @Get('posts')
  @PublicRateLimit() // 100 per minute
  async getPosts() {}
}
```

**Pattern 4: Custom Limits**

```typescript
@Controller('api')
export class ApiController {
  @Post('export')
  @RateLimit(3600000, 10, 'Export limit: 10 per hour')
  async export() {}

  @Post('send-email')
  @RateLimit(300000, 5, 'Email limit: 5 per 5 minutes')
  async sendEmail() {}
}
```

#### Rate Limiting Testing

**Test Rate Limit Enforcement:**

```typescript
describe('Rate Limiting', () => {
  it('should enforce rate limit on login', async () => {
    // Make requests up to limit
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password' })
        .expect((res) => {
          expect(res.headers['x-ratelimit-limit']).toBe('5');
        });
    }

    // 6th request should be rate limited
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' })
      .expect(429)
      .expect((res) => {
        expect(res.body.message).toContain('Too many requests');
        expect(res.headers['retry-after']).toBeDefined();
      });
  });
});
```

#### Rate Limiting Documentation Reference

**Complete guide:** See `docs/GRAPHQL_AND_RATE_LIMITING.md` for comprehensive
documentation including:

- Advanced rate limiting strategies
- GraphQL subscription patterns
- Performance optimization tips
- Troubleshooting common issues

### Frontend (Next.js) Standards

#### Theme System

- **Official Package**: Use `next-themes` for theme management (already
  installed)
- **Dark Mode**: Configured in `globals.css` using `@variant dark` for Tailwind
  v4
- **Theme Provider**: Wrap app with `<ThemeProvider>` in root layout
- **Theme Switcher**: Use `<ThemeSwitcher />` or `<CompactThemeSwitcher />`
  components
- **Color Variables**: All theme colors defined in `globals.css` with
  `--color-*` CSS variables
- **No Flash**: next-themes handles SSR properly with no flash on load

#### Sidebar Component Standards

- **Reusable Component**: Always use `<Sidebar config={sidebarConfig} />` from
  `@/components/ui`
- **Configuration**: Create sidebar configs in `constants/` folder with `.tsx`
  extension
- **Features**: Multi-level menus, icons, badges, collapsible, dark mode support
- **Interface**: Use `SidebarConfig` and `SidebarItem` interfaces from
  `@/interfaces`
- **Icons**: Use inline SVG or icon components as ReactNode
- **Navigation**: Sidebar auto-detects active routes using `usePathname()`
- **Customization**: All colors controlled via CSS variables in `globals.css`

#### Modal/Dialog/Alert Standards

- **NEVER use native alert(), confirm(), or prompt()** - These are forbidden in
  production code
- **Custom Components**: Use `<Modal>`, `<Alert>`, `<Confirm>` from
  `@/components/ui`
- **Modal**: General purpose dialog with customizable size, header, footer,
  content
- **Alert**: Notification dialog with icon, title, message
  (info/success/warning/error)
- **Confirm**: Confirmation dialog with cancel/confirm buttons
  (info/warning/danger)
- **Features**: Dark mode, ESC to close, overlay click, loading states, keyboard
  accessible
- **Interfaces**: Use `ModalConfig`, `AlertConfig`, `ConfirmConfig` from
  `@/interfaces`

#### Toast Notification Standards - MANDATORY

- **ALWAYS use toast for user feedback** - Toast notifications are the primary
  way to inform users about operations
- **NEVER use Alert component for success/error messages** - Use toast instead
- **NEVER use console.log for user feedback** - Use toast for visible user
  notifications
- **Toast Library**: Using **Sonner** - professional toast component with dark
  mode support
- **Import**: `import { toast } from '@/lib/utils';`
- **When to use Toast**:
  - ✅ Success feedback after CRUD operations (create, update, delete)
  - ✅ Error messages from API calls or validation
  - ✅ Warning messages before destructive actions
  - ✅ Info messages for user guidance
  - ✅ Loading states for async operations
  - ✅ Form submission feedback
  - ✅ API response notifications

**Toast Usage Patterns:**

```typescript
import { toast } from '@/lib/utils';

// ✅ SUCCESS - Use for successful operations
toast.success('User created successfully!');
toast.success('Settings saved!');

// ✅ ERROR - Use for errors and validation failures
toast.error('Failed to delete user');
toast.error('Email is required');
toast.error(response.message); // API error message

// ✅ WARNING - Use for important notices
toast.warning('This action cannot be undone');
toast.warning('Session will expire in 5 minutes');

// ✅ INFO - Use for informational messages
toast.info('New update available');
toast.info('Processing your request...');

// ✅ LOADING TOAST - Use for async operations with updates
const toastId = toast.loading('Creating user...');
// Later update the same toast:
toast.success('User created successfully!', { id: toastId });
// Or on error:
toast.error('Failed to create user', { id: toastId });

// ✅ PROMISE TOAST - Automatically handles loading → success/error
await toast.promise(createUser(data), {
  loading: 'Creating user...',
  success: 'User created successfully!',
  error: 'Failed to create user',
});

// ✅ WITH OPTIONS - Custom duration, action buttons
toast.success('User deleted', {
  duration: 5000,
  action: {
    label: 'Undo',
    onClick: () => restoreUser(),
  },
});
```

**Real-World Examples:**

```typescript
// ✅ CRUD Operations Pattern
const handleCreate = async (data: CreateUserDto) => {
  try {
    const response = await usersService.create(data);
    if (isSuccessResponse(response)) {
      toast.success('User created successfully!');
      router.push('/users');
    } else {
      toast.error(response.message);
    }
  } catch (error) {
    toast.error('An unexpected error occurred');
  }
};

// ✅ Form Validation Pattern
const handleSubmit = async (formData: FormData) => {
  if (!formData.email) {
    toast.error('Email is required');
    return;
  }
  if (!formData.password) {
    toast.error('Password is required');
    return;
  }

  // Continue with submission...
  await toast.promise(submitForm(formData), {
    loading: 'Submitting form...',
    success: 'Form submitted successfully!',
    error: 'Failed to submit form',
  });
};

// ✅ Bulk Operations Pattern
const handleBulkDelete = async (userIds: string[]) => {
  const toastId = toast.loading(`Deleting ${userIds.length} users...`);

  try {
    const response = await usersService.bulkDelete(userIds);
    if (isSuccessResponse(response)) {
      toast.success(`${response.data.affected} users deleted`, { id: toastId });
    } else {
      toast.error(response.message, { id: toastId });
    }
  } catch (error) {
    toast.error('Failed to delete users', { id: toastId });
  }
};

// ✅ API Error Handling Pattern
import { showApiError } from '@/lib/utils';

try {
  await apiCall();
} catch (error) {
  showApiError(error); // Automatically parses and shows error message
}

// ✅ Validation Errors Pattern
import { showValidationErrors } from '@/lib/utils';

const errors = {
  email: 'Email is required',
  password: 'Password must be at least 8 characters',
};
showValidationErrors(errors);
// Shows: "Email is required, Password must be at least 8 characters"
```

**When to use Alert vs Toast:**

- ✅ **Use Toast**: Quick feedback, success/error messages, notifications,
  non-critical info
- ✅ **Use Alert Dialog**: Critical information that requires user
  acknowledgment
- ✅ **Use Confirm Dialog**: Destructive actions requiring explicit confirmation
- ❌ **Never use Alert for**: Success messages, form validation, API responses
  (use toast instead)

**Toast Best Practices:**

1. **Keep messages concise** - Short, clear, actionable
2. **Use appropriate severity** - Match toast type to message importance
3. **Provide context** - Include relevant details (user email, count, etc.)
4. **Handle all states** - Show loading, success, and error states
5. **Avoid overuse** - Don't show toast for every minor action
6. **Use promise toast** - For async operations, automatically handles states
7. **Update existing toasts** - Use toast ID to update loading → success/error
8. **Add actions when needed** - Provide undo button for reversible actions

**Toast Helper Functions:**

```typescript
import { toast, showApiError, showValidationErrors } from '@/lib/utils';

// Automatically handles unknown error types
showApiError(error);

// Shows all validation errors in one toast
showValidationErrors({ email: 'Required', password: 'Too short' });

// Dismiss specific toast or all toasts
toast.dismiss(toastId);
toast.dismiss(); // Dismiss all
```

**Toast Configuration:**

- Position: top-right
- Duration: 4000ms (4 seconds)
- Auto-dismiss: Enabled
- Close button: Enabled
- Dark mode: Automatic
- Rich colors: Enabled (color-coded by type)

**Documentation**: See `client/docs/TOAST_SYSTEM.md` for complete guide

**Modal Usage Example:**

```tsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="My Modal"
  size="md"
>
  <p>Modal content here</p>
</Modal>;
```

**Alert Usage Example:**

```tsx
import { Alert } from '@/components/ui';

<Alert
  isOpen={alertOpen}
  onClose={() => setAlertOpen(false)}
  title="Success"
  message="Operation completed successfully"
  type="success"
/>;
```

**Confirm Usage Example:**

```tsx
import { Confirm } from '@/components/ui';

<Confirm
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Delete User"
  message="Are you sure? This action cannot be undone."
  type="danger"
  onConfirm={async () => {
    await deleteUser();
  }}
/>;
```

**Sidebar Usage Example:**

```tsx
import { Sidebar } from '@/components/ui';
import { adminSidebarConfig } from '@/constants/admin-sidebar';

<Sidebar config={adminSidebarConfig} />;
```

**Sidebar Config Example:**

```tsx
// constants/my-sidebar.tsx
export const mySidebarConfig: SidebarConfig = {
  header: {
    title: 'My App',
    logo: <LogoComponent />,
  },
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <DashboardIcon />,
      children: [
        /* nested items */
      ],
    },
  ],
};
```

#### Frontend File Structure - STRICT REQUIREMENTS

```
client/
  app/                          # Next.js App Router
    admin/                      # Admin pages (protected)
      layout.tsx                # Admin layout (professional sidebar, header)
      page.tsx                  # Admin dashboard
      users/                    # Users management (admin)
        page.tsx
        [id]/
          page.tsx
    (public)/                   # Public pages (route group)
      about/
        page.tsx
      contact/
        page.tsx
    layout.tsx                  # Root layout
    page.tsx                    # Home page (public)
    globals.css                 # Global styles + theme variables

  components/                   # Reusable components
    ui/                         # Generic UI components (buttons, inputs, modals, Sidebar)
      LoadingSpinner.tsx
      ErrorMessage.tsx
      Pagination.tsx
      Sidebar.tsx               # Professional reusable sidebar component
      index.ts                  # Barrel export
    user/                       # Feature-specific components
      UserCard.tsx
      UserForm.tsx
      index.ts

  lib/                          # Core library code
    api/                        # API client and services
      client.ts                 # Axios wrapper with interceptors and token refresh
      users.service.ts          # Feature API services
      auth.service.ts           # Authentication service
      session.service.ts        # Session management service
      index.ts
    providers/                  # Context providers
      auth-provider.tsx         # Auth provider with session management
      theme-provider.tsx        # Theme provider using next-themes
      index.ts
    utils/                      # Utility functions
      api-response.ts
      storage.ts                  # Storage utility (ALWAYS use, never localStorage directly)
      validation.ts
      toast.ts                    # Toast utilities
      index.ts

  hooks/                        # Custom React hooks
    useUsers.ts
    index.ts

  interfaces/                   # TypeScript interfaces
    user.interface.ts
    auth.interface.ts
    sidebar.interface.ts        # Sidebar navigation types
    index.ts                    # Barrel export

  types/                        # TypeScript type definitions
    api.types.ts
    index.ts                    # Barrel export

  enums/                        # TypeScript enums
    common.enum.ts
    index.ts                    # Barrel export

  constants/                    # Application constants
    common.ts
    admin-sidebar.tsx           # Admin sidebar navigation config (.tsx for JSX)
    index.ts                    # Barrel export

  docs/                         # Documentation
    CLIENT_ARCHITECTURE.md
    CODE_QUALITY.md
    MODAL_COMPONENTS.md
    SESSION_MANAGEMENT.md       # Client-side session management guide
    TOAST_SYSTEM.md
    REFRESH_TROUBLESHOOTING.md  # Page refresh troubleshooting guide
```

#### Layout Architecture

**Admin Layout (`app/admin/layout.tsx`):**

- Wraps all admin pages automatically
- Includes sidebar navigation
- Includes admin header with logout
- Protected routes (requires authentication)
- Used for: Users management, Dashboard, Settings

**Public Layout (default `app/layout.tsx`):**

- Wraps all public pages
- Includes public navigation
- No authentication required
- Used for: Home, About, Contact, Login, Register

**Route Groups:**

- Use `(public)` folder for grouping public pages without affecting URL
- Use `admin` folder for admin pages (adds `/admin` to URL)

#### Next.js Code Patterns

**Server vs Client Components:**

- **Server Components (default)**: Data fetching, static content, no
  interactivity
- **Client Components ('use client')**: State management, event handlers,
  browser APIs, hooks
- Rule: Use Server Components unless you need client-side features

**Components:**

- Use functional components with TypeScript
- Prefer server components by default, use 'use client' only when needed
- Keep components small and reusable
- **Always define prop types as interfaces**
- **Add JSDoc comments to exported components**

```typescript
/**
 * Button component with variant support
 *
 * @param props - Component props
 * @returns JSX Element
 */
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

**API Client:**

- Use axios with custom wrapper class
- Centralize API calls in service classes
- **Always use proper TypeScript types - NO `any` types**
- Implement request/response interceptors
- Handle errors globally

```typescript
import { apiClient } from '@/lib/api';
import { User } from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

export class UsersService {
  async getAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiSuccessResponse<User[]> | ApiErrorResponse> {
    return apiClient.get<User[]>('/users', { page, limit });
  }
}

export const usersService = new UsersService();
```

**Client-Side Authentication & Session Management:**

- **AuthProvider**: Wrap app with `<AuthProvider>` for global auth state
- **useAuthContext Hook**: Use `useAuthContext()` to access auth context (login,
  logout, user, etc.)
- **Protected Routes**: Wrap admin pages with `<ProtectedRoute>` component
- **Token Storage**: Use `storage.ts` utility (handles strings and objects
  correctly)
- **Automatic Token Refresh**: Proactive refresh every 13 minutes (tokens expire
  in 15 min)
- **Session Validation**: Background validation every 5 minutes
- **Page Refresh Persistence**: NO logout on page refresh - tokens restored from
  localStorage
- **Request Queue**: Prevents duplicate refresh requests during concurrent API
  calls
- **Multi-Device Sessions**: Backend tracks sessions per device with IP, user
  agent
- **Logout**: Blacklists token on server and clears client state

```typescript
// Using auth in components
'use client';

import { useAuthContext } from '@/lib/providers/auth-provider';
import { toast } from '@/lib/utils';

export function LoginForm() {
  const { login, isLoading } = useAuthContext();

  const handleSubmit = async (data: LoginDto) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Login successful!');
      router.push('/admin');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Storage Utility - CRITICAL:**

- **ALWAYS use storage utility functions** from `@/lib/utils/storage`
- **NEVER use localStorage directly** - use `getStorageItem`, `setStorageItem`,
  `removeStorageItem`
- Utility handles both strings (tokens) and objects (user data) correctly
- Prevents JSON wrapping issues with JWT tokens

```typescript
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
} from '@/lib/utils/storage';
import { StorageKey } from '@/enums';

// Get token (returns string without extra quotes)
const token = getStorageItem<string>(StorageKey.ACCESS_TOKEN);

// Get user object (returns parsed object)
const user = getStorageItem<User>(StorageKey.USER_DATA);

// Set token (stores as plain string)
setStorageItem(StorageKey.ACCESS_TOKEN, 'eyJhbGc...');

// Set user (stores as JSON)
setStorageItem(StorageKey.USER_DATA, { id: '123', email: 'user@example.com' });

// Remove item
removeStorageItem(StorageKey.ACCESS_TOKEN);
```

**Protected Route Pattern:**

```typescript
// app/admin/layout.tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute requireEmailVerification={false}>
      {children}
    </ProtectedRoute>
  );
}
```

**Auth Service Pattern:**

```typescript
// lib/api/auth.service.ts
import { apiClient } from './client';
import { LoginDto, RegisterDto } from '@/interfaces';

export class AuthService {
  async login(dto: LoginDto) {
    return apiClient.post('/auth/login', dto);
  }

  async register(dto: RegisterDto) {
    return apiClient.post('/auth/register', dto);
  }

  async logout() {
    return apiClient.post('/auth/logout', {});
  }

  async refreshToken(refreshToken: string) {
    return apiClient.post('/auth/refresh', { refreshToken });
  }

  async getCurrentUser() {
    return apiClient.get('/auth/me');
  }
}

export const authService = new AuthService();
```

### Session Management & Token Refresh - PRODUCTION READY

**Backend Session Management:**

- Session entity tracks userId, refreshToken, deviceInfo, IP, userAgent,
  expiration
- SessionService handles session CRUD, validation, and automatic cleanup
- Cron jobs clean up expired (2 AM) and inactive sessions (3 AM, >30 days)
- Multi-device tracking with device name, type, IP address
- Force logout all sessions endpoint for security

**Client-Side Session Management:**

- Professional request queue management in API client
- Prevents duplicate token refresh requests during concurrent API calls
- Token expiration detection with 2-minute buffer before expiry
- Automatic token refresh every 13 minutes (tokens expire in 15 minutes)
- Session validation every 5 minutes to catch invalidated sessions
- Page refresh persistence - NO logout when user presses F5
- Event-driven auth:logout synchronization for multi-tab support

**Token Lifecycle:**

```
Access Token: 15 minutes expiry
Refresh Token: 7 days expiry
Refresh Interval: 13 minutes (2 min buffer)
Session Validation: Every 5 minutes
```

**Page Refresh Flow:**

1. Load tokens and user from localStorage
2. Check if access token is expired/expiring
3. If expired → automatic refresh using stored refresh token
4. If valid → restore auth state
5. Setup automatic refresh interval (13 min)
6. Setup session validation interval (5 min)
7. User stays logged in ✅

**API Client Token Management:**

```typescript
// lib/api/client.ts
// Automatic token injection in request interceptor
private setupInterceptors(): void {
  this.client.interceptors.request.use(async (config) => {
    const token = getStorageItem<string>(StorageKey.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Automatic token refresh on 401 with request queue
  this.client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Request queue prevents duplicate refreshes
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(this.client(originalRequest));
            });
          });
        }
        // Refresh token and retry
      }
    }
  );
}
```

**Session Service Usage:**

```typescript
import { sessionService } from '@/lib/api';

// Get all user sessions
const sessions = await sessionService.getUserSessions();

// Revoke specific session
await sessionService.revokeSession('session-uuid');

// Revoke all except current
await sessionService.revokeOtherSessions();

// Force logout all devices
await sessionService.logoutAllSessions();
```

export const authService = new AuthService();

````

**Server Components:**
- Fetch data directly in server components
- Use async/await
- Handle loading and error states
- **Type API responses properly**

```typescript
import { usersService } from '@/lib/api';
import { isSuccessResponse } from '@/lib/utils';

export default async function UsersPage() {
  const response = await usersService.getAll(1, 10);

  if (!isSuccessResponse(response)) {
    return <ErrorMessage message={response.message} />;
  }

  return (
    <div>
      {response.data.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  );
}
````

**Client Components:**

- Use 'use client' directive at the top
- Manage state with useState/useReducer
- **Use custom hooks for complex logic and API calls**
- **Always type state and props**

```typescript
'use client';

import { useState } from 'react';
import { CreateUserDto } from '@/interfaces';

interface UserFormProps {
  onSubmit: (data: CreateUserDto) => Promise<void>;
}

export function UserForm({ onSubmit }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

**Custom Hooks:**

- Create hooks for reusable logic
- **Return typed objects, never use `any`**
- Use useCallback for functions
- Handle loading, error, and data states

```typescript
import { useState, useCallback } from 'react';
import { User } from '@/interfaces';
import { usersService } from '@/lib/api';
import { isSuccessResponse } from '@/lib/utils';

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: (page: number, limit: number) => Promise<void>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page: number, limit: number) => {
    setIsLoading(true);
    const response = await usersService.getAll(page, limit);

    if (isSuccessResponse<User[]>(response)) {
      setUsers(response.data);
    } else {
      setError(response.message);
    }

    setIsLoading(false);
  }, []);

  return { users, isLoading, error, fetchUsers };
}
```

### Database (PostgreSQL + TypeORM)

**Migrations:**

- Always use migrations for schema changes
- Never modify entities directly in production
- Name migrations descriptively

**Queries:**

- Use TypeORM QueryBuilder for complex queries
- Avoid N+1 queries - use eager loading or joins
- Add indexes for frequently queried fields

### Testing Standards - MANDATORY

**CRITICAL: Write tests for EVERY controller and service**

- Test files must be co-located with source files (`.spec.ts` extension)
- Every controller MUST have a corresponding `.controller.spec.ts` file
- Every service MUST have a corresponding `.service.spec.ts` file
- Tests must be written BEFORE or IMMEDIATELY AFTER implementation
- Never commit code without accompanying tests
- **ALWAYS update test files when modifying services or controllers**
- **Run tests after every change to verify nothing is broken**

**Test Setup and Configuration:**

**E2E Tests Setup:** E2E tests run against a real test database with the
following setup:

1. Creates PostgreSQL database: `test_db`
2. Applies global prefix: `app.setGlobalPrefix('api/v1', { exclude: ['/'] })`
3. Enables database synchronization for test environment
4. Uses same validation pipes and filters as production
5. Runs full application flow including database operations

**Setup Script:**

```bash
cd server
./test/setup-test-db.sh  # Creates test_db
yarn test:e2e:setup       # Setup database and run E2E tests
```

**Environment Configuration:** Test environment variables in
`test/setup-e2e.ts`:

- `NODE_ENV=test`
- `DATABASE_NAME=test_db`
- `DATABASE_HOST=localhost`
- Auto-synchronization enabled for test database
- Mail service configured with test credentials

**When Modifying Existing Code:**

1. **Before making changes**: Run `yarn test` to ensure all tests pass
2. **Make your changes** to controllers, services, DTOs, or entities
3. **Immediately update** corresponding test files to reflect changes:
   - Add new test cases for new methods
   - Update mock data if DTOs/entities changed
   - Update assertions if response format changed
   - Update method signatures if parameters changed
4. **Run tests again**: `yarn test` to verify all tests still pass
5. **Check coverage**: `yarn test:cov` to ensure coverage remains >80%

**Common Test Updates Needed:**

- **DTO changes**: Update mock data in tests with new required fields
- **Response format changes**: Update assertions to match new meta fields (use
  snake_case)
- **Method signature changes**: Update function calls with new parameters
- **New validations**: Add test cases for new validation rules
- **Pagination changes**: Update findAll tests with page/limit parameters
- **Repository methods**: Add new mocked methods (e.g., `findAndCount`)

**Unit Test Requirements:**

- Test all public methods in services and controllers
- Mock external dependencies (repositories, other services, HTTP requests)
- Test both success and error cases
- Test edge cases and boundary conditions
- Use descriptive test names that explain what is being tested
- Aim for >80% code coverage
- Use Jest testing framework

**Controller Test Pattern:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const createDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      await controller.create(createDto, mockResponse as Response);

      expect(service.create).toHaveBeenCalledWith(createDto, mockResponse);
    });
  });
});
```

**Service Test Pattern:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockUser = {
        id: '123',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.not.objectContaining({ password: expect.anything() }),
        }),
      );
    });

    it('should return error if email already exists', async () => {
      const createDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const existingUser = { id: '123', ...createDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('already exists'),
        }),
      );
    });
  });
});
```

**E2E Test Requirements:**

- Test critical user flows end-to-end
- Use realistic test data
- Test error cases and validation
- Clean up test data after each test
- E2E tests go in `test/` directory at root

**E2E Test Pattern:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('API E2E Tests', () => {
  let app: INestApplication;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same configuration as main.ts
    app.setGlobalPrefix('api/v1', { exclude: ['/'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/users', () => {
    it('should create a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/v1/users')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePass123!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'success');
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data).not.toHaveProperty('password');
          expect(res.body.meta).toHaveProperty('user_id');
          expect(res.body.meta).toHaveProperty('created_at');
          createdUserId = res.body.data.id;
        });
    });
  });
});
```

**API Response Testing Standards:**

```typescript
// Success Response Structure to Test
{
  status: 'success',
  statusCode: 200,
  message: 'Operation successful',
  data: { /* your data */ },
  meta: {
    user_id: 'uuid',           // ✅ snake_case for ALL meta fields
    created_at: '2026-01-28',
    updated_at: '2026-01-28',
    total_pages: 5,
    has_next: true,
    has_previous: false
  },
  timestamp: '2026-01-28T10:00:00.000Z',
  path: '/api/v1/users'
}

// Error Response Structure to Test
{
  status: 'error',
  statusCode: 400,
  message: 'Validation failed',
  errors: ['Email is required'],
  timestamp: '2026-01-28T10:00:00.000Z',
  path: '/api/v1/users'
}
```

**Running Tests:**

```bash
yarn test              # Run all unit tests
yarn test:watch        # Run tests in watch mode
yarn test:cov          # Run tests with coverage report
yarn test:e2e          # Run end-to-end tests (requires test_db)
yarn test:e2e:setup    # Setup test database and run E2E tests
```

**Test Best Practices:**

1. **Mock External Dependencies** - Database, HTTP, file system
2. **Test Both Success and Error Cases** - Cover all code paths
3. **Use Descriptive Test Names** - Clear what is being tested
4. **Keep Tests Isolated** - No shared state between tests
5. **Test Edge Cases** - Boundary conditions, null values, empty arrays
6. **Use Test Setup/Teardown** - beforeEach, afterEach, beforeAll, afterAll
7. **Verify Security** - Password never in responses, proper error handling
8. **Check Meta Fields** - All use snake_case convention

**Critical Test Checks:**

- ✅ Password field NEVER returned in responses
- ✅ All meta fields use snake_case (user_id, created_at, total_pages)
- ✅ Proper HTTP status codes (201 Created, 409 Conflict, 404 Not Found)
- ✅ Error messages are user-friendly and descriptive
- ✅ Validation errors properly caught and returned
- ✅ Global prefix `/api/v1` applied in E2E tests
- Test error cases

### Environment Variables

**Backend (.env):**

```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=your-secret-key
CACHE_TTL=60000
CACHE_MAX_ITEMS=100
```

**Frontend (.env.local):**

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

### Frontend Code Quality Standards

**TypeScript - NEVER Use `any` Types:**

- **CRITICAL: NEVER EVER use `any` type in any code - frontend, backend,
  interfaces, components, services**
- **This is a MANDATORY rule - no exceptions**
- Use proper types, interfaces, union types, or generics instead
- Use `unknown` for truly unknown types, then use type guards
- All function parameters and return values must be typed
- All state variables must be typed
- All event handlers must have proper types

```typescript
// ❌ NEVER DO THIS - ABSOLUTELY FORBIDDEN
function fetchData(): Promise<any> { ... }
const [data, setData] = useState<any>();
const handler = (value: any) => { ... };

// ✅ ALWAYS DO THIS - USE PROPER TYPES
function fetchData<T>(): Promise<ApiSuccessResponse<T> | ApiErrorResponse> { ... }
const [data, setData] = useState<User[]>([]);
const handler = (value: string | string[] | Date) => { ... };
```

**Type Guards:** Use type guards for runtime type checking:

```typescript
import { isSuccessResponse, isErrorResponse } from '@/lib/utils';

const response = await apiClient.get<User[]>('/users');
if (isSuccessResponse<User[]>(response)) {
  console.log(response.data); // TypeScript knows this is User[]
} else {
  console.error(response.message); // TypeScript knows this is error
}
```

**Error Handling:**

- Always handle errors in API calls
- Display user-friendly error messages
- Use ErrorMessage component for consistent UI

```typescript
try {
  const response = await usersService.getAll(1, 10);
  if (isSuccessResponse<User[]>(response)) {
    setUsers(response.data);
  } else {
    setError(response.message);
  }
} catch (error) {
  setError('An unexpected error occurred');
}
```

**Frontend Code Quality Standards:**

- **CRITICAL: NEVER use console.log, console.error, console.warn in production
  code**
- Remove all debugging console statements before committing
- Use proper error handling and user-facing error messages instead
- **All interfaces MUST be in `interfaces/` folder with `.interface.ts` suffix**
- **All services MUST be in `lib/api/` folder with `.service.ts` suffix**
- **Server Components (default)**: No 'use client', for data fetching and static
  content
- **Client Components ('use client')**: Only when using state, effects, or event
  handlers
- ESLint must pass with 0 errors and 0 warnings
- TypeScript strict mode - NO `any` types allowed
- Use barrel exports (index.ts) for all folders
- Add JSDoc comments to all exported functions and components

**Component Organization:**

- UI components: Generic, reusable (buttons, inputs, modals, sidebar)
- Feature components: Specific to a feature (UserCard, PostForm)
- Always use TypeScript interfaces for props
- Add JSDoc comments for exported components
- **Sidebar Component**: Use the reusable `<Sidebar />` component from
  `@/components/ui` for all admin/dashboard layouts

**State Management:**

- Use `useState` for local component state
- Use custom hooks for shared logic and API calls
- Keep state close to where it's used
- Avoid prop drilling (use Context API for deeply nested state)

**Barrel Exports:**, `Sidebar.tsx`)

- Hooks: camelCase with 'use' prefix (e.g., `useUsers.ts`, `useAuth.ts`)
- Utilities: camelCase (e.g., `api-response.ts`, `validation.ts`)
- Types/Interfaces: PascalCase with `.interface.ts` or `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE in `constants/` folder, use `.tsx` if contains JSX
  **File Naming:**
- Components: PascalCase (e.g., `UserCard.tsx`, `LoadingSpinner.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useUsers.ts`, `useAuth.ts`)
- Utilities: camelCase (e.g., `api-response.ts`, `validation.ts`)
- Types/Interfaces: PascalCase with `.interface.ts` or `.types.ts` suffix
- Constants: UPPER_SNAKE_CASE in `constants/` folder
- Enums: PascalCase with `.enum.ts` suffix

### Git Commit Standards

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Example: `feat(users): add user registration endpoint`

### ESLint & Code Quality Standards

**ALWAYS run ESLint before committing:**

- Run `yarn lint` to check for errors and warnings
- Fix all ESLint errors - **no errors allowed**
- Address all ESLint warnings when possible
- Use `yarn lint --fix` to auto-fix formatting issues
- ESLint config is in `eslint.config.mjs` for frontend and `.eslintrc.js` for
  backend
- Never disable ESLint rules without valid justification and team approval

**Common ESLint rules to follow:**

- No unused variables or imports
- Consistent code formatting (handled by Prettier)
- Proper TypeScript types (no `any` unless explicitly allowed)
- Follow naming conventions (camelCase, PascalCase)
- Avoid console.log (use Logger in backend, proper logging in frontend)

### Testing Standards - MANDATORY

**CRITICAL: Write tests for EVERY controller and service**

- Test files must be co-located with source files (`.spec.ts` extension)
- Every controller MUST have a corresponding `.controller.spec.ts` file
- Every service MUST have a corresponding `.service.spec.ts` file
- Tests must be written BEFORE or IMMEDIATELY AFTER implementation
- Never commit code without accompanying tests
- **ALWAYS update test files when modifying services or controllers**
- **Run tests after every change to verify nothing is broken**

**When Modifying Existing Code:**

1. **Before making changes**: Run `yarn test` to ensure all tests pass
2. **Make your changes** to controllers, services, DTOs, or entities
3. **Immediately update** corresponding test files to reflect changes:
   - Add new test cases for new methods
   - Update mock data if DTOs/entities changed
   - Update assertions if response format changed
   - Update method signatures if parameters changed
4. **Run tests again**: `yarn test` to verify all tests still pass
5. **Check coverage**: `yarn test:cov` to ensure coverage remains >80%

**Common Test Updates Needed:**

- **DTO changes**: Update mock data in tests with new required fields
- **Response format changes**: Update assertions to match new meta fields (use
  snake_case)
- **Method signature changes**: Update function calls with new parameters
- **New validations**: Add test cases for new validation rules
- **Pagination changes**: Update findAll tests with page/limit parameters
- **Repository methods**: Add new mocked methods (e.g., `findAndCount`)

**Unit Test Requirements:**

- Test all public methods in services and controllers
- Mock external dependencies (repositories, other services, HTTP requests)
- Test both success and error cases
- Test edge cases and boundary conditions
- Use descriptive test names that explain what is being tested
- Aim for >80% code coverage
- Use Jest testing framework

**Controller Test Pattern:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const createDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      await controller.create(createDto, mockResponse as Response);

      expect(service.create).toHaveBeenCalledWith(createDto, mockResponse);
    });
  });
});
```

**Service Test Pattern:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockUser = {
        id: '123',
        ...createDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser as any);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockUser,
        }),
      );
    });

    it('should return error if email already exists', async () => {
      const createDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };
      const existingUser = { id: '123', ...createDto };

      jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser as any);

      await service.create(createDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('already exists'),
        }),
      );
    });
  });
});
```

**E2E Test Requirements:**

- Test critical user flows end-to-end
- Use realistic test data
- Test error cases and validation
- Clean up test data after each test
- E2E tests go in `test/` directory at root

**Running Tests:**

```bash
yarn test              # Run all unit tests
yarn test:watch        # Run tests in watch mode
yarn test:cov          # Run tests with coverage report
yarn test:e2e          # Run end-to-end tests
```

### Backend File Structure - STRICT REQUIREMENTS

**Current Structure (MUST be followed):**

```
server/
  src/
    <feature>/
      dto/              # Data Transfer Objects
      entities/         # TypeORM entities
      interfaces/       # Feature-specific interfaces
      types/            # Feature-specific types
      enums/            # Feature-specific enums
      <feature>.controller.ts
      <feature>.service.ts
      <feature>.module.ts
      <feature>.controller.spec.ts  # REQUIRED
      <feature>.service.spec.ts     # REQUIRED
    common/               # Shared/common code
      decorators/         # Custom decorators
      filters/            # Exception filters
      guards/             # Auth guards
      interceptors/       # Response interceptors
      pipes/              # Validation pipes
      interfaces/         # Shared interfaces (with index.ts barrel export)
      types/              # Shared types (with index.ts barrel export)
      enums/              # Shared enums (with index.ts barrel export)
      exceptions/         # Custom exception classes
      utils/              # Utility functions (with index.ts barrel export)
    config/               # Configuration files
    users/                # Users feature module
      dto/
      entities/
      users.controller.ts
      users.service.ts
      users.module.ts
      users.controller.spec.ts  # REQUIRED
      users.service.spec.ts     # REQUIRED
    app.controller.ts
    app.service.ts
    app.module.ts
    app.controller.spec.ts      # REQUIRED
    main.ts
  test/                   # E2E tests
    app.e2e-spec.ts
```

**File Naming Conventions:**

- Controllers: `<name>.controller.ts` with spec `<name>.controller.spec.ts`
- Services: `<name>.service.ts` with spec `<name>.service.spec.ts`
- Modules: `<name>.module.ts`
- DTOs: `<action>-<entity>.dto.ts` (e.g., `create-user.dto.ts`)
- Entities: `<entity>.entity.ts`
- Interfaces: `<name>.interface.ts` (in interfaces/ folder)
- Types: `<name>.types.ts` (in types/ folder)
- Enums: `<name>.enum.ts` (in enums/ folder)
- Utils: `<name>.util.ts` (in utils/ folder)

### ESLint & Code Quality Standards - MANDATORY

**ALWAYS run ESLint before committing:**

```bash
yarn lint          # Check for errors
yarn lint --fix    # Auto-fix formatting issues
```

**ESLint Rules (all set to ERROR):**

- `@typescript-eslint/no-unused-vars` - No unused variables or function
  parameters
- `@typescript-eslint/no-explicit-any` - No `any` type usage
- `no-console` - No console.log, console.error, console.warn
- `no-debugger` - No debugger statements
- `react-hooks/rules-of-hooks` - Hooks must follow React rules
- `react-hooks/exhaustive-deps` - useEffect dependencies must be complete

**How to Fix Common ESLint Errors:**

1. **Unused Variables/Imports:**

   ```typescript
   // ❌ BAD - unused import
   import { User, Post } from '@/interfaces'; // Post not used

   // ✅ GOOD - remove unused import
   import { User } from '@/interfaces';
   ```

2. **Unused Function Parameters (required by interface):**

   ```typescript
   // ❌ BAD - param required but not used
   function handleClick(event: React.MouseEvent) {
     doSomething();
   }

   // ✅ GOOD - prefix with underscore
   function handleClick(_event: React.MouseEvent) {
     doSomething();
   }
   ```

3. **Implicit Any Type:**

   ```typescript
   // ❌ BAD - implicit any
   items.map((item) => item.name);

   // ✅ GOOD - explicit type
   items.map((item: User) => item.name);
   // OR use type inference from array
   const items: User[] = [];
   items.map((item) => item.name); // TypeScript knows item is User
   ```

4. **Console Statements:**

   ```typescript
   // ❌ BAD - console in production
   console.log('Debug:', data);

   // ✅ GOOD - use proper error handling or remove
   // For backend: use Logger
   this.logger.log('Processing data');
   // For frontend: remove or use proper error service
   ```

**Zero Tolerance Policy:**

- **NO ESLint errors allowed in commits**
- **NO ESLint warnings should accumulate**
- Fix errors immediately, don't disable rules
- Never use `// eslint-disable` without team approval

### Code Review Checklist

Before committing:

- [ ] **All tests pass (`yarn test`)**
- [ ] **ESLint check passes with NO errors (`yarn lint`)**
- [ ] **NO unused variables or imports**
- [ ] **NO console.log or debugger statements**
- [ ] **NO inline interface/type/enum definitions**
- [ ] **All interfaces in `/interfaces` folder**
- [ ] **All types in `/types` folder**
- [ ] **All enums in `/enums` folder**
- [ ] **Test coverage is >80% for new code**
- [ ] **Every new controller has corresponding `.controller.spec.ts`**
- [ ] **Every new service has corresponding `.service.spec.ts`**
- [ ] **Test files updated if service/controller methods changed**
- [ ] **Mock data updated if DTOs/entities changed**
- [ ] **Test assertions updated if response format changed**
- [ ] Code is properly formatted (Prettier)
- [ ] Types are properly defined (no `any` types)
- [ ] All classes, methods, and complex logic have JSDoc comments
- [ ] Inline comments explain "why" not "what"
- [ ] DTOs have proper validation decorators
- [ ] API endpoints have comprehensive Swagger documentation with examples
- [ ] Swagger examples use snake_case for meta fields
- [ ] Error handling is implemented with try-catch and ApiResponse
- [ ] Sensitive data is not logged or exposed
- [ ] Environment variables are used for configuration
- [ ] Files are organized in correct folders (interfaces/, types/, enums/)
- [ ] Barrel exports (index.ts) are updated for new shared code

## Available UI Components Reference

### Core UI Components (`@/components/ui`)

#### 1. **Toast Notifications** (Primary feedback method)

```typescript
import { toast } from '@/lib/utils';

toast.success('Operation successful');
toast.error('Operation failed');
toast.warning('Warning message');
toast.info('Information message');
toast.loading('Processing...');
toast.promise(apiCall(), {
  loading: 'Loading...',
  success: 'Done!',
  error: 'Failed!',
});
```

#### 2. **Modal** - General purpose dialog

```typescript
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md" // sm, md, lg, xl, full
>
  <p>Modal content</p>
</Modal>
```

#### 3. **Alert** - Information dialog (use sparingly)

```typescript
import { Alert } from '@/components/ui';

<Alert
  isOpen={alertOpen}
  onClose={() => setAlertOpen(false)}
  title="Alert Title"
  message="Alert message"
  type="success" // info, success, warning, error
/>
```

**Note**: Prefer toast for most user feedback

#### 4. **Confirm** - Confirmation dialog for destructive actions

```typescript
import { Confirm } from '@/components/ui';

<Confirm
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Delete User"
  message="Are you sure? This cannot be undone."
  type="danger" // info, warning, danger
  onConfirm={async () => {
    await deleteUser();
  }}
/>
```

#### 5. **Sidebar** - Navigation sidebar

```typescript
import { Sidebar } from '@/components/ui';
import { adminSidebarConfig } from '@/constants/admin-sidebar';

<Sidebar config={adminSidebarConfig} />
```

#### 6. **Header** - Application header

```typescript
import { Header } from '@/components/ui';
import { adminHeaderConfig } from '@/constants/admin-header';

<Header config={adminHeaderConfig} />
```

#### 7. **Table** - Data table with sorting, pagination, selection

```typescript
import { Table } from '@/components/ui';
import { TableConfig } from '@/interfaces';

const tableConfig: TableConfig<User> = {
  columns: [
    { id: 'email', label: 'Email', sortable: true },
    { id: 'name', label: 'Name', sortable: true }
  ],
  data: users,
  loading: isLoading,
  pagination: { page: 1, limit: 10, total: 100 },
  onSort: handleSort,
  onPagination: handlePagination,
  actions: {
    view: (user) => handleView(user),
    edit: (user) => handleEdit(user),
    delete: (user) => handleDelete(user)
  }
};

<Table config={tableConfig} />
```

#### 8. **ViewDialog** - Display data in formatted dialog

```typescript
import { ViewDialog } from '@/components/ui';
import { ViewDialogConfig } from '@/interfaces';

const config: ViewDialogConfig = {
  isOpen: true,
  onClose: () => setIsOpen(false),
  title: 'User Details',
  sections: [
    {
      id: 'basic',
      title: 'Basic Info',
      fields: [
        { id: 'email', label: 'Email', value: user.email, type: 'email' },
        { id: 'name', label: 'Name', value: user.name, type: 'text' }
      ]
    }
  ]
};

<ViewDialog config={config} />
```

#### 9. **EditDialog** - Form dialog for creating/updating

```typescript
import { EditDialog } from '@/components/ui';
import { EditDialogConfig } from '@/interfaces';

const config: EditDialogConfig = {
  isOpen: true,
  onClose: () => setIsOpen(false),
  title: 'Edit User',
  sections: [
    {
      id: 'basic',
      title: 'Basic Info',
      fields: [
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          validation: { required: true }
        },
        {
          id: 'name',
          label: 'Name',
          type: 'text',
          validation: { required: true, minLength: 2 }
        }
      ]
    }
  ],
  onSubmit: async (data) => {
    await updateUser(data);
    toast.success('User updated!');
  }
};

<EditDialog config={config} />
```

#### 10. **ThemeSwitcher** - Toggle light/dark mode

```typescript
import { ThemeSwitcher, CompactThemeSwitcher } from '@/components/ui';

<ThemeSwitcher /> // Full version with icon
<CompactThemeSwitcher /> // Compact version
```

#### 11. **LoadingSpinner** - Loading indicator

```typescript
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="sm" /> // sm, md, lg
```

#### 12. **ErrorMessage** - Error display component

```typescript
import { ErrorMessage } from '@/components/ui';

<ErrorMessage message="Something went wrong" />
```

#### 13. **Pagination** - Pagination controls

```typescript
import { Pagination } from '@/components/ui';

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

### Component Usage Guidelines

1. **Always import from barrel exports**:

   ```typescript
   import { Modal, Alert, Confirm, toast } from '@/components/ui';
   import { toast } from '@/lib/utils';
   ```

2. **Use toast for most user feedback**:
   - ✅ Success/error messages
   - ✅ Form validation errors
   - ✅ API responses
   - ✅ Quick notifications

3. **Use Alert/Confirm for critical actions**:
   - ✅ Destructive operations (delete, deactivate)
   - ✅ Important warnings requiring acknowledgment
   - ✅ Confirmation before irreversible actions

4. **All components support dark mode automatically**

5. **All dialog components are accessible**:
   - ESC key to close
   - Overlay click to close (configurable)
   - Keyboard navigation
   - Focus trapping

## AI Assistance Guidelines

When generating code:

1. **ALWAYS run ESLint check (`yarn lint`) before completing the task**
2. **ALWAYS write test files (.spec.ts) for every controller and service**
3. Always include proper TypeScript types (never use `any`)
4. **Frontend: Use proper types, interfaces, generics - NEVER use `any`**
5. **Frontend: Use type guards (isSuccessResponse, isErrorResponse) for API
   responses**
6. **Frontend: ALWAYS use toast for user feedback, not console.log or Alert**
7. **Add professional JSDoc comments to all classes, interfaces, types, enums,
   and public methods**
8. **Add inline comments to explain complex logic and business decisions**
9. Organize interfaces in `interfaces/` folder with `.interface.ts` extension
10. Organize types in `types/` folder with `.types.ts` extension
11. Organize enums in `enums/` folder with `.enum.ts` extension
12. Add validation decorators to DTOs (backend)
13. Include error handling with try-catch and ApiResponse.error() (backend)
14. **Frontend: Handle errors in try-catch blocks and display user-friendly
    messages**
15. **Write tests alongside implementation (test-first or test-immediately
    approach)**
16. Add Swagger documentation for APIs (backend)
17. Follow the strict file structure outlined above
18. Use dependency injection in NestJS (backend)
19. Prefer server components in Next.js unless interactivity is needed
    (frontend)
20. **Frontend: Use custom hooks for API calls and complex state logic**
21. Use Tailwind CSS for styling (frontend)
22. Keep security in mind (validate inputs, sanitize data, use parameterized
    queries)
23. **Ensure test coverage is >80% for all new code**
24. **Update barrel exports (index.ts) when adding new shared code**
25. **Frontend: Always use barrel exports for cleaner imports**

## Common Commands

**Backend:**

```bash
yarn start:dev      # Start development server
yarn test          # Run tests
yarn test:cov      # Run tests with coverage
yarn lint          # Lint code
yarn format        # Format code
```

**Frontend:**

```bash
yarn dev           # Start development server
yarn build         # Build for production
yarn lint          # Lint code
```

**Database:**

```bash
yarn migration:generate -- -n MigrationName
yarn migration:run
```
