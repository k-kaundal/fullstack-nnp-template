## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Features

- ✅ **TypeScript** - Full TypeScript support with strict type checking
- ✅ **TypeORM** - Database ORM with PostgreSQL integration
- ✅ **JWT Authentication** - Complete auth system with email verification, password reset, refresh tokens
- ✅ **Swagger/OpenAPI** - Automatic API documentation
- ✅ **Validation** - Request validation with class-validator
- ✅ **Cache System** - In-memory caching with @nestjs/cache-manager (cache-aside pattern)
- ✅ **Rate Limiting** - Protect auth endpoints from brute force attacks
- ✅ **Error Handling** - Standardized error responses with custom exceptions
- ✅ **Response Formatting** - Consistent API response structure
- ✅ **Email Service** - Nodemailer integration for transactional emails
- ✅ **Logging** - Built-in logging with NestJS Logger
- ✅ **Testing** - Jest unit tests and E2E tests (25 auth tests passing)
- ✅ **Code Quality** - ESLint and Prettier configured
- ✅ **Professional Documentation** - JSDoc comments throughout codebase

## Authentication System

Complete JWT-based authentication with:
- User registration with email verification
- Login/logout with access & refresh tokens
- Token blacklist for secure logout
- Password reset flow with email
- Email verification with expiring tokens
- Rate limiting on all auth endpoints
- Comprehensive test coverage (25 tests)


## Cache Implementation

This project includes a standard NestJS caching system with:
- In-memory cache (easily upgradeable to Redis)
- Cache-aside pattern for read operations
- Manual cache invalidation on write operations
- Configurable TTL and max items via environment variables

See [docs/CACHE_IMPLEMENTATION.md](./docs/CACHE_IMPLEMENTATION.md) for detailed documentation.

### Cache Configuration

Add to your `.env` file:
```env
CACHE_TTL=60000        # Cache time-to-live in milliseconds
CACHE_MAX_ITEMS=100    # Maximum number of items in cache
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Deployment

### Deploy to Vercel (Serverless)

This project is **Vercel-ready** for serverless deployment!

**Quick Start (5 minutes):**
1. See [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md) for step-by-step guide
2. Or read [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md) for detailed documentation

**Deploy Now:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
cd server
vercel --prod
```

**What's included:**
- ✅ `vercel.json` - Vercel configuration
- ✅ `api/index.ts` - Serverless function handler
- ✅ `.vercelignore` - Deployment optimization
- ✅ Complete deployment documentation

### Traditional Deployment

For VPS/cloud deployment (DigitalOcean, AWS, etc.):
```bash
yarn build
yarn start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
