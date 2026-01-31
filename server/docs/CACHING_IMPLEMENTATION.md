# Caching Implementation Guide

Complete caching system with decorators, HTTP caching, database query caching, and cache warming strategies.

## Table of Contents

1. [Cache Service](#cache-service)
2. [Cache Decorators](#cache-decorators)
3. [HTTP Response Caching](#http-response-caching)
4. [Database Query Caching](#database-query-caching)
5. [Cache Warming](#cache-warming)
6. [Best Practices](#best-practices)

---

## Cache Service

Enhanced cache service with TTL, invalidation, and advanced operations.

### Basic Usage

```typescript
import { Injectable } from '@nestjs/common';
import { CacheService } from '../common/services/cache.service';

@Injectable()
export class UsersService {
  constructor(private readonly cacheService: CacheService) {}

  async getUser(id: string): Promise<User> {
    // Try to get from cache
    const cached = await this.cacheService.get<User>(`user_${id}`);
    if (cached) return cached;

    // Fetch from database
    const user = await this.usersRepository.findOne({ where: { id } });

    // Store in cache
    await this.cacheService.set(`user_${id}`, user, 60000); // 1 minute

    return user;
  }
}
```

### Cache-Aside Pattern

```typescript
async getUsers(): Promise<User[]> {
  return this.cacheService.getOrSet(
    'users_list',
    async () => {
      // This function only runs on cache miss
      return this.usersRepository.find();
    },
    300000 // 5 minutes
  );
}
```

### Batch Operations

```typescript
// Set multiple values
const entries = new Map([
  ['user_1', user1],
  ['user_2', user2],
  ['user_3', user3],
]);
await this.cacheService.setMany(entries, 60000);

// Get multiple values
const keys = ['user_1', 'user_2', 'user_3'];
const results = await this.cacheService.getMany<User>(keys);
```

### Cache Invalidation

```typescript
// Delete single key
await this.cacheService.delete('user_123');

// Delete multiple keys
await this.cacheService.deleteMany(['user_1', 'user_2', 'user_3']);

// Delete by pattern (Redis only)
await this.cacheService.deleteByPattern('user_*');

// Clear all cache
await this.cacheService.clear();
```

---

## Cache Decorators

Declarative caching with method decorators.

### @Cacheable Decorator

Cache method results automatically:

```typescript
import { Cacheable } from '../common/decorators/cache.decorator';

export class UsersService {
  @Cacheable({ key: 'active_users', ttl: 60000 })
  async getActiveUsers(): Promise<User[]> {
    return this.usersRepository.find({ where: { isActive: true } });
  }

  // Cache key includes method parameters
  @Cacheable({ key: 'user', useParams: true, ttl: 30000 })
  async getUserById(id: string): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
```

### @CacheInvalidate Decorator

Automatically invalidate cache after mutations:

```typescript
import { CacheInvalidate } from '../common/decorators/cache.decorator';

export class UsersService {
  @CacheInvalidate({ keys: ['users_list', 'active_users'] })
  async createUser(dto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(dto);
  }

  @CacheInvalidate({ keys: ['user_*'], useWildcard: true })
  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    await this.usersRepository.update(id, dto);
    return this.usersRepository.findOne({ where: { id } });
  }
}
```

### @CacheTTL Decorator

Set custom TTL for specific methods:

```typescript
import { CacheTTL } from '../common/decorators/cache.decorator';

export class ConfigService {
  @CacheTTL(3600000) // 1 hour
  async getAppConfig(): Promise<AppConfig> {
    return this.configRepository.findOne();
  }
}
```

---

## HTTP Response Caching

Add ETag, Last-Modified, and Cache-Control headers to HTTP responses.

### Basic HTTP Cache Interceptor

```typescript
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { HttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';

@Controller('users')
@UseInterceptors(HttpCacheInterceptor)
export class UsersController {
  @Get()
  async findAll() {
    // Response will include:
    // - ETag: "abc123..."
    // - Last-Modified: Thu, 31 Jan 2026 10:00:00 GMT
    // - Cache-Control: max-age=60, must-revalidate
    return this.usersService.findAll();
  }
}
```

### Configurable HTTP Cache

```typescript
import { ConfigurableHttpCacheInterceptor } from '../common/interceptors/http-cache.interceptor';

@Controller('public/posts')
@UseInterceptors(
  new ConfigurableHttpCacheInterceptor(
    300, // 5 minutes max-age
    false // public cache (CDN can cache)
  )
)
export class PublicPostsController {
  @Get()
  async findAll() {
    return this.postsService.findPublicPosts();
  }
}
```

### 304 Not Modified

The interceptor automatically returns `304 Not Modified` when:
- Client sends `If-None-Match` header matching the ETag
- Client sends `If-Modified-Since` header with recent timestamp

**Client Example:**
```bash
# First request
curl -i http://localhost:3001/api/v1/users
# Response: 200 OK with ETag: "abc123"

# Subsequent request with ETag
curl -i -H 'If-None-Match: "abc123"' http://localhost:3001/api/v1/users
# Response: 304 Not Modified (no body)
```

---

## Database Query Caching

Cache TypeORM query results to reduce database load.

### Query Builder with Cache

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryCacheUtil } from '../common/utils/query-cache.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getActiveUsers(): Promise<User[]> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .where('user.isActive = :active', { active: true })
      .orderBy('user.createdAt', 'DESC');

    return QueryCacheUtil.executeWithCache(queryBuilder, {
      id: 'active_users_query',
      duration: 60000, // 1 minute
    });
  }

  async getUserById(id: string): Promise<User | null> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id });

    return QueryCacheUtil.executeOneWithCache(queryBuilder, {
      id: `user_query_${id}`,
      duration: 30000, // 30 seconds
    });
  }
}
```

### Dynamic Cache Keys

```typescript
async searchUsers(filters: UserSearchDto): Promise<User[]> {
  const cacheKey = QueryCacheUtil.generateCacheKey('user_search', {
    search: filters.search,
    isActive: filters.isActive,
    page: filters.page,
  });

  const queryBuilder = this.usersRepository
    .createQueryBuilder('user')
    .where('user.firstName ILIKE :search', { search: `%${filters.search}%` });

  return QueryCacheUtil.executeWithCache(queryBuilder, {
    id: cacheKey,
    duration: 60000,
  });
}
```

### Count Queries with Cache

```typescript
async getUserCount(): Promise<number> {
  const queryBuilder = this.usersRepository
    .createQueryBuilder('user')
    .where('user.isActive = :active', { active: true });

  return QueryCacheUtil.executeCountWithCache(queryBuilder, {
    id: 'active_users_count',
    duration: 300000, // 5 minutes
  });
}
```

---

## Cache Warming

Pre-populate cache with frequently accessed data to reduce latency.

### Register Warming Entries

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheWarmingService } from '../common/services/cache-warming.service';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    private readonly cacheWarmingService: CacheWarmingService,
  ) {}

  async onModuleInit() {
    // Register cache warming for active users
    this.cacheWarmingService.register({
      key: 'active_users',
      factory: async () => {
        return this.usersRepository.find({ where: { isActive: true } });
      },
      ttl: 300000, // 5 minutes
      warmOnStart: true, // Warm on application startup
      schedule: '0 */5 * * * *', // Refresh every 5 minutes
    });

    // Register cache warming for user count
    this.cacheWarmingService.register({
      key: 'users_count',
      factory: async () => {
        return this.usersRepository.count();
      },
      ttl: 600000, // 10 minutes
      warmOnStart: true,
    });
  }
}
```

### Manual Cache Warming

```typescript
// Warm specific entry
await this.cacheWarmingService.warmEntry('active_users');

// Warm all entries
await this.cacheWarmingService.warmAll();
```

### Scheduled Warming

The service automatically runs warming based on cron schedules:

```typescript
this.cacheWarmingService.register({
  key: 'daily_stats',
  factory: async () => this.calculateDailyStats(),
  ttl: 3600000, // 1 hour
  warmOnStart: true,
  schedule: '0 0 * * * *', // Every hour
});
```

---

## Best Practices

### 1. Cache Key Naming Convention

```typescript
// ✅ GOOD - Descriptive and hierarchical
'user:123'
'user:list:active'
'user:count:total'
'post:123:comments'

// ❌ BAD - Unclear and flat
'u123'
'list'
'data'
```

### 2. TTL Strategy

```typescript
// Frequently accessed, rarely changing
const STATIC_DATA_TTL = 3600000; // 1 hour

// Frequently accessed, occasionally changing
const DYNAMIC_DATA_TTL = 300000; // 5 minutes

// Real-time critical data
const REALTIME_DATA_TTL = 30000; // 30 seconds
```

### 3. Cache Invalidation

```typescript
// ✅ GOOD - Invalidate related caches after mutation
@CacheInvalidate({ keys: ['user_list', 'user_count', 'user_${id}'] })
async updateUser(id: string, dto: UpdateUserDto) {
  return this.usersRepository.update(id, dto);
}

// ❌ BAD - No invalidation (stale data)
async updateUser(id: string, dto: UpdateUserDto) {
  return this.usersRepository.update(id, dto);
}
```

### 4. Cache-Aside vs Write-Through

```typescript
// ✅ Cache-Aside (lazy loading)
async getUser(id: string): Promise<User> {
  return this.cacheService.getOrSet(
    `user_${id}`,
    () => this.usersRepository.findOne({ where: { id } }),
    60000
  );
}

// ✅ Write-Through (immediate cache update)
async createUser(dto: CreateUserDto): Promise<User> {
  const user = await this.usersRepository.save(dto);
  await this.cacheService.set(`user_${user.id}`, user, 60000);
  return user;
}
```

### 5. Prevent Cache Stampede

```typescript
// ✅ GOOD - Use single promise for concurrent requests
private pendingRequests = new Map<string, Promise<User>>();

async getUser(id: string): Promise<User> {
  const cacheKey = `user_${id}`;

  // Check cache first
  const cached = await this.cacheService.get<User>(cacheKey);
  if (cached) return cached;

  // Check if request is already pending
  if (this.pendingRequests.has(cacheKey)) {
    return this.pendingRequests.get(cacheKey);
  }

  // Create new request
  const promise = this.fetchAndCacheUser(id);
  this.pendingRequests.set(cacheKey, promise);

  try {
    const user = await promise;
    return user;
  } finally {
    this.pendingRequests.delete(cacheKey);
  }
}
```

### 6. Monitor Cache Performance

```typescript
// Log cache hit/miss ratio
async getWithMetrics<T>(key: string): Promise<T | null> {
  const startTime = Date.now();
  const value = await this.cacheService.get<T>(key);
  const duration = Date.now() - startTime;

  if (value) {
    this.logger.log(`Cache HIT: ${key} (${duration}ms)`);
    this.metricsService.incrementCacheHit(key);
  } else {
    this.logger.log(`Cache MISS: ${key} (${duration}ms)`);
    this.metricsService.incrementCacheMiss(key);
  }

  return value;
}
```

---

## Configuration

### Enable Caching in App Module

```typescript
import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';

@Module({
  imports: [CommonModule],
})
export class AppModule {}
```

### Environment Variables

```env
# Cache Configuration
CACHE_TTL=60000            # Default TTL in ms
CACHE_MAX_ITEMS=100        # Maximum cache items
CACHE_ENABLED=true         # Enable/disable caching

# Redis (optional - for distributed caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

---

## Testing Cache

```typescript
describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheModule.register()],
      providers: [CacheService],
    }).compile();

    cacheService = module.get<CacheService>(CacheService);
  });

  it('should set and get value', async () => {
    await cacheService.set('test_key', 'test_value', 1000);
    const value = await cacheService.get('test_key');
    expect(value).toBe('test_value');
  });

  it('should return null for expired key', async () => {
    await cacheService.set('test_key', 'test_value', 100);
    await new Promise(resolve => setTimeout(resolve, 200));
    const value = await cacheService.get('test_key');
    expect(value).toBeNull();
  });
});
```

---

## Summary

✅ **Cache Service** - Advanced operations with TTL and invalidation
✅ **Cache Decorators** - Declarative caching with @Cacheable, @CacheInvalidate
✅ **HTTP Caching** - ETag, Last-Modified, Cache-Control, 304 responses
✅ **Query Caching** - TypeORM query result caching
✅ **Cache Warming** - Pre-populate cache on startup and scheduled
✅ **Best Practices** - Naming, TTL, invalidation, stampede prevention

All implementations follow production-ready patterns with proper logging, error handling, and type safety.
