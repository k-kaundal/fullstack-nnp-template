# Quick Reference: New Features Patterns

## 🚀 GraphQL Patterns

### Create Schema (.graphql file)

```graphql
type User {
  id: ID!
  email: String!
  firstName: String!
}

type Query {
  users(page: Int, limit: Int): PaginatedUsers!
  user(id: ID!): User
}

type Mutation {
  createUser(email: String!, firstName: String!): User!
}
```

### Create Resolver

```typescript
@Resolver('User')
export class UserResolver {
  @Query('users')
  @UseGuards(GqlAuthGuard)
  async getUsers(@Args('page', { type: () => Int }) page: number = 1) {
    // Reuse existing services
  }
}
```

### GraphQL Authentication Guard

```typescript
@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}
```

---

## 🛡️ Rate Limiting Patterns

### Use Decorators

```typescript
// Login/Register - 5 attempts per 15 min
@Post('login')
@AuthRateLimit()
async login() { }

// Sensitive operations - 10 per minute
@Delete(':id')
@StrictRateLimit()
async remove() { }

// Public endpoints - 100 per minute
@Get()
@PublicRateLimit()
async findAll() { }

// Custom limits
@Post('export')
@RateLimit(3600000, 10, 'Export limit: 10/hour')
async export() { }

// Skip rate limiting
@Get('health')
@SkipRateLimit()
async health() { }
```

### Custom Throttler Guard

```typescript
@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected getTracker(request: Request): Promise<string> {
    // User ID for authenticated, IP for anonymous
    if (request.user?.sub) {
      return Promise.resolve(`user:${request.user.sub}`);
    }
    return Promise.resolve(`ip:${request.ip}`);
  }
}
```

---

## 🔄 API Versioning Patterns

### Version Endpoints

```typescript
// V1 (deprecated)
@Get()
@Version('1')
@ApiDeprecated('2026-12-31', 'https://api.example.com/docs/migration')
async findAllV1() { }

// V2 (current)
@Get()
@Version('2')
async findAllV2() { }

// Support multiple versions
@Get(':id')
@Version(['1', '2'])
async findOne(@Param('id') id: string) { }
```

### Versioning in main.ts

```typescript
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

---

## ⚙️ Environment Configuration Patterns

### Validation Class

```typescript
class EnvironmentVariables {
  @IsString() NODE_ENV: string;
  @IsNumber() PORT: number;
  @IsBoolean() RATE_LIMIT_ENABLED: boolean;
}
```

### Type-Safe Access

```typescript
const apiUrl = this.configService.get<string>('API_URL_LOCAL');
const port = this.configService.get<number>('PORT', 3001);
const isProduction = this.configService.get('NODE_ENV') === 'production';
```

---

## 📦 Package Versions (CRITICAL)

### GraphQL Stack

```json
{
  "@apollo/server": "4.11.2",
  "@nestjs/apollo": "12.2.0",
  "@nestjs/graphql": "12.2.0",
  "graphql": "16.12.0",
  "ts-morph": "27.0.2"
}
```

### Rate Limiting

```json
{
  "@nestjs/throttler": "6.5.0"
}
```

---

## 🌐 CORS Configuration

```typescript
app.enableCors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'Retry-After',
  ],
});
```

---

## 🎯 Common Tasks

### Add GraphQL for New Entity

1. Create schema: `src/graphql/schema/post.graphql`
2. Create resolver: `src/graphql/resolvers/post.resolver.ts`
3. Import module in `graphql.module.ts`
4. Protect with `@UseGuards(GqlAuthGuard)`
5. Reuse existing service layer

### Add Rate Limiting to Controller

1. Choose appropriate decorator:
   - `@AuthRateLimit()` for login/register
   - `@StrictRateLimit()` for sensitive operations
   - `@PublicRateLimit()` for public endpoints
   - `@RateLimit(ttl, limit, msg)` for custom limits
2. Add to controller method
3. Test with multiple requests
4. Check rate limit headers

### Deprecate API Version

1. Add `@ApiDeprecated('sunset-date', 'migration-url')`
2. Create new version endpoint
3. Update documentation
4. Announce to API consumers
5. Monitor usage of old version
6. Remove after sunset date (6-12 months)

### Add New Environment Variable

1. Add to `.env` file
2. Add to `.env.example` with description
3. Add validation in `env.validation.ts`
4. Document in README
5. Use `ConfigService` to access
6. Never commit `.env` file

---

## 🧪 Testing Commands

```bash
# Build server
cd server && yarn build

# Run tests
yarn test

# Run E2E tests
yarn test:e2e

# Check coverage
yarn test:cov

# Lint code
yarn lint

# Start dev server
yarn start:dev

# Access GraphQL Playground
# http://localhost:3001/graphql
```

---

## 📚 Documentation Files

- Copilot Instructions: `.github/copilot-instructions.md`
- GraphQL + Rate Limiting: `docs/GRAPHQL_AND_RATE_LIMITING.md`
- API Versioning: `docs/API_VERSIONING_AND_SWAGGER.md`
- Database Features: `server/docs/DATABASE_FEATURES.md`
- Update Summary: `COPILOT_INSTRUCTIONS_UPDATE.md`

---

**Keep this file handy for quick reference when working on the project!**
