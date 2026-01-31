# Request Logging System

Complete request logging system with database storage, automatic cleanup, and admin endpoints for monitoring.

## Features

✅ **Automatic Request Logging** - All HTTP requests tracked
✅ **Database Storage** - Logs stored in PostgreSQL
✅ **Sensitive Data Sanitization** - Passwords/tokens redacted
✅ **Automatic Cleanup** - Cron job deletes logs older than 24 hours
✅ **Admin Endpoints** - View logs, statistics, and trigger manual cleanup
✅ **Performance Tracking** - Response time and error rate monitoring

---

## Database Schema

### RequestLog Entity

```typescript
{
  id: string; // UUID
  method: string; // GET, POST, PUT, DELETE, etc.
  path: string; // Request URL
  statusCode: number; // HTTP status code
  responseTime: number; // Response time in ms
  userId: string; // User ID (if authenticated)
  ipAddress: string; // Client IP address
  userAgent: string; // User agent string
  requestBody: string; // Sanitized request body (JSON)
  queryParams: string; // Query parameters (JSON)
  errorMessage: string; // Error message (if failed)
  createdAt: Date; // Request timestamp
}
```

**Indexes:**

- `createdAt` - For efficient cleanup queries
- `userId` - For user-specific log retrieval
- `method, path` - For endpoint analysis

---

## Automatic Logging

All HTTP requests are automatically logged via middleware.

### What's Logged

✅ HTTP method and path
✅ Response status code
✅ Response time (ms)
✅ User ID (if authenticated)
✅ Client IP address
✅ User agent
✅ Request body (sanitized)
✅ Query parameters
✅ Error messages

### Sensitive Data Sanitization

The following fields are automatically redacted:

- `password`
- `token`
- `secret`
- `apiKey`
- `refreshToken`

**Example:**

```json
// Original request body
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Stored in database
{
  "email": "user@example.com",
  "password": "***REDACTED***"
}
```

---

## Automatic Cleanup

### Cron Job Schedule

**Daily at 2:00 AM** - Deletes logs older than 24 hours

```typescript
@Cron(CronExpression.EVERY_DAY_AT_2AM)
async cleanupOldLogs(): Promise<void> {
  const deletedCount = await this.requestLoggerService.deleteOldLogs(24);
  // Logs: "Deleted 1523 request logs older than 24 hours"
}
```

### Retention Period

**Default:** 24 hours
**Configurable:** Can be changed in `LogCleanupService.LOG_RETENTION_HOURS`

---

## Admin Endpoints

### 1. Get All Request Logs

```http
GET /api/v1/admin/request-logs?page=1&limit=50
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request logs fetched successfully",
  "data": [
    {
      "id": "uuid",
      "method": "POST",
      "path": "/api/v1/users",
      "statusCode": 201,
      "responseTime": 145,
      "userId": "user-uuid",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "requestBody": "{\"email\":\"test@example.com\",\"password\":\"***REDACTED***\"}",
      "queryParams": null,
      "errorMessage": null,
      "createdAt": "2026-01-31T10:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1234,
    "count": 50,
    "page": 1,
    "limit": 50,
    "total_pages": 25,
    "has_next": true,
    "has_previous": false
  }
}
```

---

### 2. Get User Request Logs

```http
GET /api/v1/admin/request-logs/user?userId=<uuid>&page=1&limit=50
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User request logs fetched successfully",
  "data": [...],
  "meta": {
    "user_id": "user-uuid",
    "total": 45,
    "count": 45,
    "page": 1,
    "limit": 50,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

---

### 3. Get Statistics

```http
GET /api/v1/admin/request-logs/statistics
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Request statistics fetched successfully",
  "data": {
    "total": 5432,
    "today": 234,
    "errors": 12,
    "averageResponseTime": 127
  }
}
```

---

### 4. Get Cleanup Statistics

```http
GET /api/v1/admin/request-logs/cleanup/stats
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Cleanup statistics fetched successfully",
  "data": {
    "totalLogs": 1234,
    "todayLogs": 234,
    "retentionHours": 24,
    "nextCleanup": "2026-02-01T02:00:00.000Z"
  }
}
```

---

### 5. Trigger Manual Cleanup

```http
POST /api/v1/admin/request-logs/cleanup/trigger?hours=24
Authorization: Bearer <token>
```

**Response:**

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Cleanup completed: 523 logs deleted",
  "data": {
    "deleted_count": 523
  }
}
```

---

## Usage in Services

### Programmatic Access

```typescript
import { RequestLoggerService } from '../common/services/request-logger.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly requestLoggerService: RequestLoggerService) {}

  async getUserActivity(userId: string) {
    const { logs, total } = await this.requestLoggerService.getUserRequestLogs(
      userId,
      1,
      100,
    );

    return {
      totalRequests: total,
      recentActivity: logs.slice(0, 10),
    };
  }

  async getEndpointUsage() {
    // Custom query for endpoint usage analysis
    const stats = await this.requestLoggerService.getStatistics();
    return stats;
  }
}
```

---

## Configuration

### Change Retention Period

Edit `LogCleanupService`:

```typescript
export class LogCleanupService {
  private readonly LOG_RETENTION_HOURS = 48; // Keep for 2 days instead
}
```

### Change Cleanup Schedule

```typescript
@Cron('0 3 * * *') // Run at 3 AM instead of 2 AM
async cleanupOldLogs(): Promise<void> {
  // ...
}
```

### Add More Sensitive Fields

Edit `RequestLoggerService`:

```typescript
private readonly SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'apiKey',
  'refreshToken',
  'creditCard',
  'ssn',
];
```

---

## Performance Considerations

### Database Indexes

The `RequestLog` entity has indexes on:

- `createdAt` - Fast cleanup queries
- `userId` - Fast user log retrieval
- `method, path` - Endpoint analysis

### Async Logging

Logging happens asynchronously and doesn't block HTTP responses:

```typescript
res.on('finish', () => {
  // Log asynchronously (non-blocking)
  this.requestLoggerService.logRequest(logData).catch((error) => {
    // Log error but don't fail the request
  });
});
```

### Cleanup Performance

Cleanup uses indexed `createdAt` field for efficient deletion:

```sql
DELETE FROM request_logs
WHERE "createdAt" < '2026-01-30T02:00:00.000Z';
```

---

## Monitoring & Alerts

### Check Storage Size

```sql
SELECT
  pg_size_pretty(pg_total_relation_size('request_logs')) as table_size,
  COUNT(*) as total_logs
FROM request_logs;
```

### Monitor Error Rate

```sql
SELECT
  DATE_TRUNC('hour', "createdAt") as hour,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN "statusCode" >= 400 THEN 1 END) as errors,
  ROUND(AVG("responseTime")) as avg_response_time
FROM request_logs
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

---

## Migration

Run migration to create the `request_logs` table:

```bash
cd server
./scripts/generate-migration.sh AddRequestLogsTable
./scripts/run-migrations.sh
```

---

## Integration with App Module

The logging module is automatically integrated:

```typescript
import { Module } from '@nestjs/common';
import { LoggingModule } from './common/logging.module';

@Module({
  imports: [
    LoggingModule, // Auto-applies middleware to all routes
  ],
})
export class AppModule {}
```

---

## Best Practices

1. ✅ **Keep retention period short** - 24-48 hours is usually sufficient
2. ✅ **Monitor storage growth** - Set up alerts for table size
3. ✅ **Use indexes** - Essential for performance with large datasets
4. ✅ **Sanitize sensitive data** - Never log passwords or tokens
5. ✅ **Run cleanup during low traffic** - 2-3 AM is ideal
6. ✅ **Export important logs** - Before cleanup if needed for compliance
7. ✅ **Monitor cleanup job** - Ensure it runs successfully

---

## Troubleshooting

### Cleanup Job Not Running

Check NestJS scheduler is enabled:

```typescript
@Module({
  imports: [ScheduleModule.forRoot()],
})
```

### High Database Storage

Reduce retention period or cleanup frequency:

```typescript
// Run cleanup twice daily
@Cron('0 2,14 * * *')
async cleanupOldLogs(): Promise<void> {
  await this.requestLoggerService.deleteOldLogs(12); // 12 hours
}
```

### Slow Queries

Ensure indexes exist:

```sql
CREATE INDEX IF NOT EXISTS "IDX_request_logs_created_at"
ON request_logs ("createdAt");
```

---

## Summary

✅ Automatic request logging with middleware
✅ Database storage with indexes
✅ Sensitive data sanitization
✅ Daily automatic cleanup (2 AM)
✅ 24-hour retention period
✅ Admin endpoints for monitoring
✅ Performance optimized with async logging
✅ Production-ready with proper error handling

All request logs are automatically tracked, stored, and cleaned up without manual intervention!
