# Testing Guide

## Quick Reference

### Running Tests

```bash
# Backend Tests
cd server
yarn test              # Run all unit tests
yarn test:watch        # Watch mode for development
yarn test:cov          # Generate coverage report
yarn test:e2e          # Run E2E tests (requires test_db)
yarn test:e2e:setup    # Setup test database and run E2E tests

# Frontend Tests (when implemented)
cd client
yarn test              # Run all tests
```

### Setup Test Database (First Time)

```bash
cd server
./test/setup-test-db.sh
```

## Test Architecture

### Unit Tests

- **Location**: Co-located with source files (`*.spec.ts`)
- **Purpose**: Test individual methods and business logic
- **Speed**: Fast (milliseconds)
- **Dependencies**: All mocked
- **Database**: Not used (mocked)

### E2E Tests

- **Location**: `server/test/` directory
- **Purpose**: Test complete request-response flows
- **Speed**: Slower (seconds)
- **Dependencies**: Real (database, HTTP)
- **Database**: Uses `test_db` PostgreSQL database

## Test Standards

### Mandatory Requirements

✅ Every controller MUST have a `.controller.spec.ts` file ✅ Every service MUST
have a `.service.spec.ts` file ✅ Test coverage must be >80% ✅ All tests must
pass before committing ✅ Update tests when modifying code

### API Response Format to Test

**Success Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "user_id": "uuid",
    "created_at": "2026-01-28",
    "total_pages": 5,
    "has_next": true
  },
  "timestamp": "2026-01-28T10:00:00.000Z",
  "path": "/api/v1/users"
}
```

**Error Response:**

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["Email is required"],
  "timestamp": "2026-01-28T10:00:00.000Z",
  "path": "/api/v1/users"
}
```

### Critical Checks

- ✅ Password field NEVER in responses
- ✅ Meta fields use snake_case (user_id, not userId)
- ✅ Proper HTTP status codes
- ✅ Validation errors handled
- ✅ Global prefix `/api/v1` in E2E tests

## E2E Test Setup Explained

### How E2E Tests Work

1. **Test Database Creation**
   - Script: `test/setup-test-db.sh`
   - Creates PostgreSQL database: `test_db`
   - Drops existing database for clean slate

2. **Application Configuration**
   - Global prefix: `/api/v1` (except root `/`)
   - Validation pipes enabled
   - Auto-synchronization enabled for test environment
   - Same configuration as production

3. **Test Execution Flow**
   ```
   Test Request
       ↓
   Supertest HTTP Client
       ↓
   NestJS Application
       ↓
   Controller → Service → Repository
       ↓
   PostgreSQL test_db
       ↓
   Response
       ↓
   Assertions
   ```

### Environment Configuration

Test environment variables in `test/setup-e2e.ts`:

```typescript
process.env.NODE_ENV = 'test';
process.env.DATABASE_NAME = 'test_db';
process.env.DATABASE_HOST = 'localhost';
```

Database auto-synchronization is enabled:

```typescript
// src/app.module.ts
synchronize: configService.get('NODE_ENV') === 'development' ||
  configService.get('NODE_ENV') === 'test';
```

## Writing Tests

### Unit Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Response } from 'express';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
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
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should create user successfully', async () => {
    const createDto = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };
    const mockUser = { id: '123', ...createDto };

    jest.spyOn(repository, 'findOne').mockResolvedValue(null);
    jest.spyOn(repository, 'create').mockReturnValue(mockUser as any);
    jest.spyOn(repository, 'save').mockResolvedValue(mockUser as any);

    await service.create(createDto, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        data: expect.not.objectContaining({ password: expect.anything() }),
      }),
    );
  });
});
```

### E2E Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Users E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // CRITICAL: Apply global prefix
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

  it('should create a user', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users') // Note: includes /api/v1 prefix
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
        expect(res.body.meta).toHaveProperty('user_id'); // snake_case
      });
  });
});
```

## Common Issues and Solutions

### Issue: Tests fail with 404 errors

**Solution:** Add global prefix in test setup:

```typescript
app.setGlobalPrefix('api/v1', { exclude: ['/'] });
```

### Issue: "relation does not exist" error

**Solution:** Run test database setup:

```bash
./test/setup-test-db.sh
```

### Issue: Password field in response

**Solution:** Add before returning user:

```typescript
delete user.password;
```

### Issue: Tests expect user_id but get userId

**Solution:** Use snake_case for ALL meta fields:

```typescript
meta: {
  user_id: user.id,        // ✅ Correct
  created_at: new Date(),  // ✅ Correct
  // NOT: userId, createdAt ❌
}
```

## Test Checklist

When writing tests, verify:

- [ ] Test file exists alongside source file
- [ ] All public methods are tested
- [ ] Both success and error cases covered
- [ ] Mock all external dependencies
- [ ] Response structure validated
- [ ] Password never in response
- [ ] Meta fields use snake_case
- [ ] Proper HTTP status codes
- [ ] Error messages are descriptive
- [ ] Global prefix used in E2E tests

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: cd server && yarn install

      - name: Run unit tests
        run: cd server && yarn test

      - name: Setup test database
        run: cd server && ./test/setup-test-db.sh

      - name: Run E2E tests
        run: cd server && yarn test:e2e
```

## Additional Resources

- **Detailed E2E Setup Guide**: `server/docs/E2E_TEST_FIXES.md`
- **NestJS Testing Docs**: https://docs.nestjs.com/fundamentals/testing
- **Jest Documentation**: https://jestjs.io/docs/getting-started
- **Supertest Documentation**: https://github.com/ladjs/supertest

---

**Current Test Status:**

- ✅ 15/15 E2E tests passing
- ✅ 25/25 Unit tests passing
- ✅ All security checks passing
- ✅ API response format validated
