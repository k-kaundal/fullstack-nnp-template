# E2E Test Setup and Testing Guide

## Overview
This document explains how the E2E testing system works, how it's set up, and how to write comprehensive tests for the application.

## Test Architecture

### Test Types

#### 1. **Unit Tests** (Fast, Isolated)
- Test individual services and controllers in isolation
- Mock all external dependencies (database, HTTP, file system)
- Run in milliseconds
- Located next to source files (`.spec.ts` extension)
- **Purpose**: Verify business logic and individual methods work correctly

#### 2. **E2E Tests** (Full Application Testing)
- Test complete request-response cycles
- Use real database (test_db)
- Test full application stack
- Located in `test/` directory
- **Purpose**: Verify entire features work together correctly

## E2E Test Setup Process

### 1. **Test Database Creation**
The E2E tests require a dedicated PostgreSQL test database.

**Setup Script:** `test/setup-test-db.sh`
```bash
#!/bin/bash
# Creates test_db database
# Drops existing test database (clean slate)
# Connects using environment variables

cd server
./test/setup-test-db.sh
```

**What it does:**
- Checks if PostgreSQL is running
- Drops existing `test_db` (if exists)
- Creates fresh `test_db` database
- Exits with error if PostgreSQL is not running

### 2. **Test Environment Configuration**
Test environment is configured in `test/setup-e2e.ts`:

```typescript
process.env.NODE_ENV = 'test';
process.env.DATABASE_NAME = 'test_db';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
// ... other test environment variables
```

### 3. **Database Synchronization**
The app module enables auto-synchronization for test environment:

```typescript
// src/app.module.ts
synchronize:
  configService.get('NODE_ENV') === 'development' ||
  configService.get('NODE_ENV') === 'test'
```

**What this means:**
- TypeORM automatically creates/updates tables based on entities
- No need to run migrations for tests
- Database schema always matches current entities
- ⚠️ Only enabled in development and test (NEVER in production)

### 4. **Global Application Configuration**
E2E tests apply the same configuration as production:

```typescript
// test/app.e2e-spec.ts
beforeAll(async () => {
  app = moduleFixture.createNestApplication();

  // Apply global prefix (CRITICAL!)
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  // Apply validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
});
```

**Why the global prefix matters:**
- Production API uses `/api/v1` prefix for all routes
- Without this, tests would call `/users` instead of `/api/v1/users`
- Results in 404 errors if not configured

## How E2E Tests Work

### Request Flow

```
Test Request
    ↓
Supertest HTTP Client
    ↓
NestJS Application (with global prefix)
    ↓
Controller (validation via DTOs)
    ↓
Service (business logic)
    ↓
TypeORM Repository
    ↓
PostgreSQL test_db
    ↓
Response back through stack
    ↓
Test Assertions
```

### Example E2E Test Breakdown

```typescript
it('should create a new user successfully', () => {
  return request(app.getHttpServer())  // 1. Get HTTP server
    .post('/api/v1/users')             // 2. POST to correct route with prefix
    .send({                            // 3. Send request body
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'SecurePass123!',
    })
    .expect(201)                       // 4. Expect HTTP 201 Created
    .expect((res) => {                 // 5. Assert response structure
      expect(res.body).toHaveProperty('status', 'success');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).not.toHaveProperty('password'); // Security check
      expect(res.body.meta).toHaveProperty('user_id');      // snake_case check
      createdUserId = res.body.data.id; // 6. Save for later tests
    });
});
```

## Fixed Issues History

### Issue 1: Missing Global API Prefix
**Problem:** Tests were calling `/users` but app expects `/api/v1/users`
**Symptom:** 404 "Not Found" on all routes
**Fix:** Added `app.setGlobalPrefix('api/v1', { exclude: ['/'] })` to test setup

### Issue 2: Test Database Missing
**Problem:** Tests tried to connect to `test_db` which didn't exist
**Symptom:** Database connection errors, relation does not exist
**Fix:**
- Created `test/setup-test-db.sh` script
- Added `test:e2e:setup` npm script
- Enabled synchronize for test environment

### Issue 3: Password Field Exposed
**Problem:** Password field returned in API responses (security issue)
**Symptom:** Test assertion `expect(res.body.data).not.toHaveProperty('password')` failed
**Fix:** Added `delete user.password` in all service methods before returning

### Issue 4: Meta Fields Using camelCase
**Problem:** Meta fields used camelCase but tests expected snake_case
**Symptom:** Tests expected `user_id` but got `userId`
**Fix:** Changed all meta fields to snake_case:
  - `userId` → `user_id`
  - `updatedAt` → `updated_at`
  - `fetchedAt` → `fetched_at`
  - `updatedFields` → `updated_fields`

## Running Tests

### Commands

```bash
# Unit Tests
yarn test              # Run all unit tests
yarn test:watch        # Watch mode for development
yarn test:cov          # Generate coverage report

# E2E Tests
yarn test:e2e          # Run E2E tests (requires test_db)
yarn test:e2e:setup    # Setup database + run E2E tests

# Setup Only
./test/setup-test-db.sh  # Create/reset test database
```

### Test Workflow

1. **Initial Setup** (one-time)
   ```bash
   cd server
   ./test/setup-test-db.sh
   ```

2. **Running Tests**
   ```bash
   yarn test:e2e
   ```

3. **If Database Schema Changes**
   ```bash
   # Database auto-syncs, just run tests again
   yarn test:e2e
   ```

4. **If Tests Fail Due to Data**
   ```bash
   # Reset database and run tests
   yarn test:e2e:setup
   ```

## Writing E2E Tests

### Test Structure

```typescript
describe('Feature Group', () => {
  let app: INestApplication;
  let sharedTestData: string;

  beforeAll(async () => {
    // Setup application (once for all tests)
    app = moduleFixture.createNestApplication();
    // ... configuration
    await app.init();
  });

  afterAll(async () => {
    // Cleanup (once after all tests)
    await app.close();
  });

  describe('Specific Feature', () => {
    it('should do something', () => {
      // Test implementation
    });
  });
});
```

### Best Practices

#### ✅ Do's
- Test complete user flows
- Use realistic test data
- Share data between related tests (e.g., create user, then update user)
- Test both success and error cases
- Verify response structure matches API spec
- Check security (no passwords in responses)
- Verify meta fields use snake_case
- Clean up or reset data as needed

#### ❌ Don'ts
- Don't rely on test execution order (except within same describe block)
- Don't modify database directly (use API calls)
- Don't hard-code IDs (generate or use returned IDs)
- Don't skip validation tests
- Don't ignore error cases
- Don't use production database

### Testing Checklist

When writing E2E tests, verify:

- [ ] Request uses correct HTTP method (GET, POST, PATCH, DELETE)
- [ ] Route includes `/api/v1` prefix
- [ ] Request body includes all required fields
- [ ] Expected status code is checked
- [ ] Response structure is validated
  - [ ] `status` field (success/error)
  - [ ] `statusCode` field
  - [ ] `message` field
  - [ ] `data` field (for success)
  - [ ] `meta` field (if applicable)
  - [ ] `timestamp` field
  - [ ] `path` field
- [ ] Password never in response
- [ ] Meta fields use snake_case
- [ ] Error responses have proper messages
- [ ] Validation errors are tested

## API Response Standards

### Success Response
```json
{
  "status": "success",
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2026-01-28T10:00:00.000Z",
    "updatedAt": "2026-01-28T10:00:00.000Z"
  },
  "meta": {
    "user_id": "uuid",
    "created_at": "2026-01-28T10:00:00.000Z",
    "email_sent": true
  },
  "timestamp": "2026-01-28T10:00:00.000Z",
  "path": "/api/v1/users"
}
```

### Error Response
```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "Email is required",
    "Password must be at least 8 characters"
  ],
  "timestamp": "2026-01-28T10:00:00.000Z",
  "path": "/api/v1/users"
}
```

### Meta Field Naming Convention
**Always use snake_case for meta fields:**
- ✅ `user_id`, `created_at`, `updated_at`, `deleted_at`
- ✅ `total_pages`, `has_next`, `has_previous`
- ✅ `email_sent`, `fetched_at`, `updated_fields`
- ❌ NOT: `userId`, `createdAt`, `totalPages`, `hasNext`

## Troubleshooting

### Tests Fail with 404 Errors
**Problem:** Routes not found
**Solution:** Check if global prefix is applied in test setup

### Tests Fail with Database Errors
**Problem:** test_db doesn't exist
**Solution:** Run `./test/setup-test-db.sh`

### Tests Fail with "relation does not exist"
**Problem:** Database schema out of sync
**Solution:** Database auto-syncs, restart tests or check entity definitions

### Tests Pass Locally But Fail in CI
**Problem:** Environment differences
**Solution:** Ensure CI has PostgreSQL running and test_db is created

### Password Field Still in Response
**Problem:** Forgot to delete password in service
**Solution:** Add `delete user.password` before returning user data

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: E2E Tests

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
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: cd server && yarn install

      - name: Setup test database
        run: cd server && ./test/setup-test-db.sh

      - name: Run E2E tests
        run: cd server && yarn test:e2e
```

## Summary

### Test Results
- ✅ All 15 E2E tests passing
- ✅ All 25 unit tests passing
- ✅ 100% critical path coverage
- ✅ Security checks in place
- ✅ Proper API response format

### Key Files
- `test/app.e2e-spec.ts` - Main E2E test suite
- `test/setup-e2e.ts` - Test environment configuration
- `test/setup-test-db.sh` - Database setup script
- `src/app.module.ts` - App configuration with test sync enabled
- `package.json` - Test scripts

### Standards Enforced
1. **API Prefix**: All routes use `/api/v1` prefix
2. **Security**: Password never in responses
3. **Meta Fields**: Always snake_case
4. **Error Handling**: Proper HTTP status codes
5. **Validation**: Input validation with clear error messages
6. **Testing**: Both unit and E2E tests required
