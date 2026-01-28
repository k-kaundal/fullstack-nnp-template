# Cache Implementation Guide

## Overview
This project implements a standard NestJS caching system using `@nestjs/cache-manager` and `cache-manager`. The cache system follows the cache-aside pattern with manual invalidation for data consistency.

## Architecture

### Cache Configuration
- **Location**: `src/config/cache.config.ts`
- **Type**: In-memory cache (default)
- **TTL**: Configurable via `CACHE_TTL` environment variable (default: 60000ms = 1 minute)
- **Max Items**: Configurable via `CACHE_MAX_ITEMS` environment variable (default: 100)

### Global Configuration
Cache is registered globally in `app.module.ts`:
```typescript
CacheModule.registerAsync({
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: cacheConfig,
  inject: [ConfigService],
})
```

## Cache Components

### 1. Cache Configuration (`src/config/cache.config.ts`)
Factory function that provides cache configuration using environment variables.

### 2. Cache Key Decorator (`src/common/decorators/cache-key.decorator.ts`)
Custom decorator for defining cache key prefixes:
```typescript
@CacheKey('users')
@Get()
async findAll() {
  // Will use 'users' as cache key prefix
}
```

### 3. Cache Interceptor (`src/common/interceptors/cache.interceptor.ts`)
HTTP cache interceptor for automatic controller-level caching. Can be applied to entire controllers or specific routes.

## Usage in Services

### Injecting Cache Manager
```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class YourService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}
}
```

### Cache-Aside Pattern (Read Operations)
```typescript
async findOne(id: string): Promise<Entity> {
  // 1. Try to get from cache
  const cacheKey = `entity_${id}`;
  const cached = await this.cacheManager.get<Entity>(cacheKey);

  if (cached) {
    return cached;
  }

  // 2. Fetch from database
  const entity = await this.repository.findOne({ where: { id } });

  // 3. Store in cache
  await this.cacheManager.set(cacheKey, entity, this.CACHE_TTL);

  return entity;
}
```

### Cache Invalidation (Write Operations)
```typescript
async update(id: string, data: UpdateDto): Promise<Entity> {
  // Update database
  const updated = await this.repository.save({ id, ...data });

  // Invalidate cache
  await this.cacheManager.del(`entity_${id}`);
  await this.cacheManager.del('entity_list');

  return updated;
}
```

## Cache Key Conventions

### Individual Items
Format: `{resource}_{id}`
- Example: `user_123`, `post_456`, `comment_789`

### Collections/Lists
Format: `{resource}_list` or `{resource}_list_{filter}`
- Example: `user_list`, `post_list_active`, `comment_list_approved`

## Environment Variables

Add to your `.env` file:
```env
# Cache Configuration
CACHE_TTL=60000        # Cache time-to-live in milliseconds (default: 60s)
CACHE_MAX_ITEMS=100    # Maximum number of items in cache (default: 100)
```

## Testing Cache Implementation

### Mock Cache Manager in Tests
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('YourService', () => {
  let service: YourService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });
});
```

### Test Cache Hit Scenario
```typescript
it('should return cached data', async () => {
  const cachedData = { id: '1', name: 'Test' };
  jest.spyOn(cacheManager, 'get').mockResolvedValue(cachedData);

  const result = await service.findOne('1');

  expect(cacheManager.get).toHaveBeenCalledWith('entity_1');
  expect(result).toEqual(cachedData);
});
```

### Test Cache Miss Scenario
```typescript
it('should fetch from DB and cache', async () => {
  const dbData = { id: '1', name: 'Test' };
  jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
  jest.spyOn(repository, 'findOne').mockResolvedValue(dbData);
  jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

  const result = await service.findOne('1');

  expect(cacheManager.get).toHaveBeenCalledWith('entity_1');
  expect(repository.findOne).toHaveBeenCalled();
  expect(cacheManager.set).toHaveBeenCalledWith('entity_1', dbData, 60000);
});
```

### Test Cache Invalidation
```typescript
it('should invalidate cache on update', async () => {
  jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

  await service.update('1', { name: 'Updated' });

  expect(cacheManager.del).toHaveBeenCalledWith('entity_1');
  expect(cacheManager.del).toHaveBeenCalledWith('entity_list');
});
```

## Best Practices

### 1. Cache Keys
- Use descriptive prefixes for resources
- Include entity ID for individual items
- Use consistent naming conventions
- Document cache key patterns in code

### 2. Cache Invalidation
- **ALWAYS** invalidate cache after CREATE operations
- **ALWAYS** invalidate cache after UPDATE operations
- **ALWAYS** invalidate cache after DELETE operations
- Invalidate both individual item and list caches

### 3. Cache TTL
- Set appropriate TTL based on data volatility
- Use shorter TTL for frequently changing data
- Use longer TTL for static/reference data
- Consider different TTLs for dev vs production

### 4. Logging
- Log cache operations for debugging
- Include cache key in log messages
- Log cache hits and misses
- Log invalidation operations

### 5. Error Handling
- Wrap cache operations in try-catch
- Don't let cache failures break application
- Fall back to database if cache fails
- Log cache errors for monitoring

## Example Implementation

See `src/users/users.service.ts` for a complete reference implementation with:
- Cache-aside pattern in `findOne()`
- Cache invalidation in `create()`, `update()`, and `remove()`
- Proper error handling
- Comprehensive logging
- Cache metadata in responses

## Cache Strategies

### When to Use Caching
- ✅ Frequently accessed data
- ✅ Data that changes infrequently
- ✅ Expensive database queries
- ✅ Read-heavy operations
- ✅ Reference/lookup data

### When NOT to Use Caching
- ❌ Real-time data requirements
- ❌ Highly volatile data
- ❌ User-specific sensitive data (without proper isolation)
- ❌ Large datasets (consider pagination first)
- ❌ Write-heavy operations

## Monitoring and Debugging

### Debug Cache Operations
Enable detailed logging in development:
```typescript
this.logger.debug(`Cache ${hit ? 'HIT' : 'MISS'} for key: ${cacheKey}`);
```

### Cache Statistics
Consider implementing cache hit/miss metrics:
- Cache hit rate
- Average response time with/without cache
- Cache size and memory usage
- Most frequently cached items

## Future Enhancements

### Redis Integration
To use Redis instead of in-memory cache:
```typescript
import { redisStore } from 'cache-manager-redis-store';

CacheModule.register({
  store: redisStore,
  host: 'localhost',
  port: 6379,
});
```

### Custom Cache Strategies
- LRU (Least Recently Used)
- LFU (Least Frequently Used)
- TTL-based expiration
- Size-based eviction

### Distributed Caching
For multi-instance deployments, use Redis or Memcached to share cache across instances.

## Related Files
- `src/config/cache.config.ts` - Cache configuration
- `src/common/decorators/cache-key.decorator.ts` - Cache key decorator
- `src/common/interceptors/cache.interceptor.ts` - HTTP cache interceptor
- `src/users/users.service.ts` - Example implementation
- `.github/copilot-instructions.md` - Caching standards and guidelines
