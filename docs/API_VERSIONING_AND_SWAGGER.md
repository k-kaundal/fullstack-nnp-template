# API Versioning & Swagger Documentation - Implementation Guide

## Overview

Complete API versioning system with URI and header-based versioning, deprecation
management, and advanced Swagger documentation with comprehensive examples.

---

## 1. API Versioning System

### Features Implemented

- ✅ URI-based versioning (`/api/v1`, `/api/v2`)
- ✅ Header-based versioning (`X-API-Version`, `Accept-Version`)
- ✅ Version deprecation notices with sunset dates
- ✅ Automatic deprecation warning headers
- ✅ Migration guides and alternative endpoint suggestions

### URI Versioning (Primary Method)

**Configuration**: Enabled in `main.ts`

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
  prefix: 'api/v',
});
```

**Controller Usage:**

```typescript
@Controller({ path: 'users', version: '1' })
export class UsersController {
  // All endpoints under /api/v1/users
}

@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  // All endpoints under /api/v2/users
}
```

**Endpoint Examples:**

```bash
GET /api/v1/users        # Version 1 API
GET /api/v2/users        # Version 2 API
POST /api/v1/auth/login  # Version 1 authentication
```

### Header-Based Versioning (Alternative)

**Supported Headers:**

- `X-API-Version: 1`
- `Accept-Version: 1`

**Usage:**

```bash
curl -H "X-API-Version: 2" https://api.example.com/api/users
curl -H "Accept-Version: 2" https://api.example.com/api/users
```

**Decorator for Documentation:**

```typescript
import { ApiHeaderVersioning } from '../common/decorators/api-version.decorator';

@ApiHeaderVersioning()
@Get()
async findAll() {
  // Method supports header versioning
}
```

---

## 2. Deprecation Management

### Marking Endpoints as Deprecated

**Location**: `server/src/common/decorators/api-version.decorator.ts`

**Usage:**

```typescript
import { ApiDeprecated } from '../common/decorators/api-version.decorator';

@Controller({ path: 'users', version: '1' })
export class UsersController {
  @Get()
  @ApiDeprecated({
    version: '1',
    deprecatedAt: '2026-01-01',
    sunsetDate: '2026-06-01',
    reason: 'Upgrading to v2 with improved response format',
    alternativeEndpoint: '/api/v2/users',
    migrationGuide: 'https://docs.example.com/migration/v1-to-v2',
  })
  async findAll() {
    // Deprecated endpoint
  }
}
```

### Deprecation Response Headers

Deprecated endpoints automatically include these headers:

```http
X-API-Deprecated: true
X-API-Deprecation-Date: 2026-01-01
X-API-Sunset: 2026-06-01
Sunset: 2026-06-01
X-API-Alternative: /api/v2/users
Warning: 299 - "Deprecated API - Sunset: 2026-06-01"
X-API-Warn: 299 - "Deprecated API - Sunset: 2026-06-01"
```

### Swagger Documentation for Deprecated Endpoints

Deprecated endpoints show:

- ⚠️ Deprecation warning badge
- Deprecation date
- Sunset date
- Reason for deprecation
- Alternative endpoint
- Link to migration guide

---

## 3. Advanced Swagger Documentation

### Configuration

**Location**: `server/src/config/swagger.config.ts`

**Features:**

- Comprehensive API description with markdown support
- Multiple server configurations (development, production)
- JWT Bearer authentication
- API Key authentication
- Custom CSS styling
- Request/response examples
- Error documentation
- Auto-export OpenAPI JSON/YAML

### Swagger UI Customization

**Custom Features:**

- Persistent authorization (token saved in browser)
- Request duration display
- Search/filter functionality
- Syntax highlighting (Monokai theme)
- Request snippets
- Try-it-out enabled by default

**Accessing Swagger UI:**

```
Local: http://localhost:3001/api/docs
Production: https://your-api.vercel.app/api/docs
```

### OpenAPI Export

**Auto-generated files** (development only):

- `docs/api/openapi.json` - OpenAPI 3.0 JSON format
- `docs/api/openapi.yaml` - OpenAPI 3.0 YAML format

**Manual export:**

```bash
curl http://localhost:3001/api/docs-json > openapi.json
```

---

## 4. Request/Response Examples

### Using Example Decorators

**Location**: `server/src/common/decorators/api-examples.decorator.ts`

**Available Decorators:**

#### 1. Success Response Example

```typescript
import { ApiSuccessResponse } from '../common/decorators/api-examples.decorator';

@Get()
@ApiSuccessResponse(
  HttpStatus.OK,
  'Users retrieved successfully',
  [
    {
      id: 'uuid',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    },
  ],
  {
    total: 100,
    page: 1,
    limit: 10,
  },
)
async findAll() {}
```

#### 2. Error Response Examples

```typescript
import { ApiErrorResponse } from '../common/decorators/api-examples.decorator';

@Post()
@ApiErrorResponse(
  HttpStatus.BAD_REQUEST,
  'Validation failed',
  'Validation failed',
  ['Email is required', 'Password must be at least 8 characters'],
)
async create() {}
```

#### 3. Complete CRUD Examples

```typescript
import { ApiCrudExamples } from '../common/decorators/api-examples.decorator';

@Get(':id')
@ApiCrudExamples('User', {
  id: 'uuid',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
})
async findOne() {}
```

#### 4. Authentication Examples

```typescript
import { ApiAuthExamples } from '../common/decorators/api-examples.decorator';

@Post('login')
@ApiAuthExamples()
async login() {}
```

#### 5. Pagination Examples

```typescript
import { ApiPaginationExamples } from '../common/decorators/api-examples.decorator';

@Get()
@ApiPaginationExamples({
  id: 'uuid',
  name: 'Example',
})
async findAll() {}
```

---

## 5. Complete Controller Example

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiSuccessResponse,
  ApiPaginationExamples,
  ApiCrudExamples,
} from '../common/decorators/api-examples.decorator';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '../common/decorators';
import {
  ApiDeprecated,
  ApiHeaderVersioning,
} from '../common/decorators/api-version.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description: 'Retrieves a paginated list of all users',
  })
  @ApiHeaderVersioning()
  @ApiPaginationExamples({
    id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
  })
  @ApiUnauthorizedResponse('/api/v1/users')
  async findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.usersService.findAll(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a single user by their UUID',
  })
  @ApiCrudExamples('User', {
    id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    createdAt: '2026-01-31T10:23:22.983Z',
    updatedAt: '2026-01-31T10:23:22.983Z',
  })
  @ApiNotFoundResponse('User', '/api/v1/users/:id')
  @ApiUnauthorizedResponse('/api/v1/users/:id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('old-endpoint')
  @ApiDeprecated({
    version: '1',
    deprecatedAt: '2026-01-01',
    sunsetDate: '2026-06-01',
    reason: 'Use GET /api/v2/users instead',
    alternativeEndpoint: '/api/v2/users',
    migrationGuide: 'https://docs.example.com/migration',
  })
  async oldEndpoint() {
    // Deprecated endpoint with automatic warning headers
  }
}
```

---

## 6. Migration Strategy

### Version 1 to Version 2 Migration

**Step 1: Create V2 Controller**

```typescript
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  // New implementation
}
```

**Step 2: Deprecate V1 Endpoint**

```typescript
@Controller({ path: 'users', version: '1' })
export class UsersController {
  @Get()
  @ApiDeprecated({
    version: '1',
    deprecatedAt: '2026-01-01',
    sunsetDate: '2026-06-01',
    alternativeEndpoint: '/api/v2/users',
  })
  async findAll() {}
}
```

**Step 3: Announce Deprecation**

- Update API documentation
- Send email notifications to API consumers
- Add deprecation notices to Swagger UI
- Include sunset date (minimum 6 months)

**Step 4: Monitor Usage**

```bash
# Check access logs for V1 usage
grep "GET /api/v1/" access.log | wc -l
```

**Step 5: Remove Deprecated Version**

- After sunset date
- Ensure all consumers migrated
- Remove V1 controller and routes
- Update documentation

---

## 7. Best Practices

### Versioning Strategy

1. ✅ **Use URI versioning** for public APIs (easier for clients)
2. ✅ **Version in route path** not query parameters
3. ✅ **Semantic versioning** for major changes only
4. ✅ **Backward compatibility** within same major version
5. ✅ **Deprecation period** of at least 6 months

### Deprecation Policy

1. ✅ **Announce early** - Notify consumers immediately
2. ✅ **Clear sunset date** - Specific removal date
3. ✅ **Provide alternatives** - Document migration path
4. ✅ **Include in responses** - Add deprecation headers
5. ✅ **Monitor usage** - Track deprecated endpoint calls

### Documentation Standards

1. ✅ **Complete examples** for all endpoints
2. ✅ **Error responses** documented with examples
3. ✅ **Authentication** clearly explained
4. ✅ **Request/response schemas** with real data
5. ✅ **Try-it-out** enabled for testing

---

## 8. Testing API Versions

### Using cURL

**Test V1 endpoint:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v1/users
```

**Test V2 endpoint:**

```bash
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v2/users
```

**Test header versioning:**

```bash
curl -H "Authorization: Bearer <token>" \
     -H "X-API-Version: 2" \
     http://localhost:3001/api/users
```

**Test deprecated endpoint:**

```bash
curl -i -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/v1/deprecated-endpoint

# Response headers will include:
# X-API-Deprecated: true
# X-API-Sunset: 2026-06-01
# Warning: 299 - "Deprecated API - Sunset: 2026-06-01"
```

### Using Swagger UI

1. Navigate to `http://localhost:3001/api/docs`
2. Click "Authorize" and enter JWT token
3. Deprecated endpoints show with strikethrough
4. Try different API versions
5. View request/response examples
6. Test endpoints directly in browser

---

## 9. Monitoring & Analytics

### Track API Version Usage

**Add custom logging:**

```typescript
@Injectable()
export class VersionLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const version = request.headers['x-api-version'] || 'v1';

    // Log API version usage
    console.log(`API Version: ${version}, Endpoint: ${request.url}`);

    return next.handle();
  }
}
```

### Deprecation Warnings Analytics

**Track deprecated endpoint usage:**

```typescript
@Injectable()
export class DeprecationAnalytics {
  logDeprecatedUsage(endpoint: string, userId: string) {
    // Send to analytics service
    // Alert if usage is high
  }
}
```

---

## 10. Files Created/Modified

### Created Files

1. `server/src/common/decorators/api-version.decorator.ts` - Versioning
   decorators
2. `server/src/common/decorators/api-examples.decorator.ts` - Example decorators
3. `server/src/common/interceptors/versioning.interceptor.ts` - Deprecation
   interceptor
4. `server/src/config/swagger.config.ts` - Advanced Swagger config
5. `docs/api/openapi.json` - Auto-exported OpenAPI JSON
6. `docs/api/openapi.yaml` - Auto-exported OpenAPI YAML

### Modified Files

1. `server/src/main.ts` - Added versioning and Swagger setup
2. `server/src/users/users.controller.ts` - Added version and examples
3. `server/src/auth/auth.controller.ts` - Added version
4. `server/src/app.controller.ts` - Enhanced health check
5. `server/src/app.service.ts` - Updated health check response

---

## 11. Summary

**✅ All Features Implemented:**

- URI-based API versioning (`/api/v1`, `/api/v2`)
- Header-based versioning support
- Deprecation notices with sunset dates
- Migration guides and alternative endpoints
- Advanced Swagger UI with customization
- Comprehensive request/response examples
- Error response documentation
- Authentication documentation
- OpenAPI JSON/YAML export
- Persistent authorization
- Request duration display

**🚀 Ready for Production**

- All endpoints versioned
- Deprecation system functional
- Swagger documentation complete
- OpenAPI export working
- Migration strategy documented
