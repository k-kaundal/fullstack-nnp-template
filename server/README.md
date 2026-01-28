## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Features

- ✅ **TypeScript** - Full TypeScript support with strict type checking
- ✅ **TypeORM** - Database ORM with PostgreSQL integration
- ✅ **Swagger/OpenAPI** - Automatic API documentation
- ✅ **Validation** - Request validation with class-validator
- ✅ **Cache System** - In-memory caching with @nestjs/cache-manager (cache-aside pattern)
- ✅ **Error Handling** - Standardized error responses with custom exceptions
- ✅ **Response Formatting** - Consistent API response structure
- ✅ **Logging** - Built-in logging with NestJS Logger
- ✅ **Testing** - Jest unit tests and E2E tests
- ✅ **Code Quality** - ESLint and Prettier configured
- ✅ **Professional Documentation** - JSDoc comments throughout codebase

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
