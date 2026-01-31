# Session Management System

Complete multi-device session management with tracking, invalidation, and force logout capabilities.

## 📋 Overview

The session management system tracks user logins across multiple devices and provides:

- ✅ **Multi-device login tracking** - See all active sessions
- ✅ **Device information** - Browser, OS, device type
- ✅ **Session invalidation** - Revoke specific sessions
- ✅ **Force logout** - Logout from all devices at once
- ✅ **Automatic cleanup** - Expired sessions removed automatically
- ✅ **Security** - IP address and user agent tracking

## 🗄️ Database Schema

### Sessions Table
```sql
CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "refreshToken" text NOT NULL,
  "deviceName" varchar(255),           -- e.g., "Chrome on macOS"
  "deviceType" varchar(100),           -- desktop, mobile, tablet, unknown
  "ipAddress" varchar(45),             -- Client IP address
  "userAgent" text,                    -- Full user agent string
  "expiresAt" TIMESTAMP NOT NULL,      -- Session expiration (7 days)
  "lastActivityAt" TIMESTAMP,          -- Last API request timestamp
  "isActive" boolean DEFAULT true,     -- Session status
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX "IDX_user_sessions" ON "sessions" ("userId", "isActive");
CREATE INDEX "IDX_refresh_token" ON "sessions" ("refreshToken");
```

## 🔧 Backend Implementation

### 1. Session Entity (`server/src/auth/entities/session.entity.ts`)
```typescript
@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'text' })
  refreshToken: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceType: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
```

### 2. Session Service (`server/src/auth/session.service.ts`)

**Key Methods:**

```typescript
// Create new session on login
createSession(data: {
  userId: string;
  refreshToken: string;
  expiresAt: Date;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<Session>

// Get all active sessions for user
getUserSessions(userId: string): Promise<Session[]>

// Invalidate specific session
invalidateSession(sessionId: string): Promise<boolean>

// Invalidate all user sessions
invalidateAllUserSessions(userId: string): Promise<number>

// Invalidate all except current session
invalidateOtherSessions(userId: string, currentSessionId: string): Promise<number>
```

**Automatic Cleanup (Cron Jobs):**

- **Expired sessions** - Runs daily at 2 AM
- **Inactive sessions** - Runs daily at 3 AM (removes sessions older than 30 days)

### 3. Device Information Extraction

Auth service automatically detects:

- **Browser:** Chrome, Safari, Firefox, Edge
- **OS:** Windows, macOS, Linux, Android, iOS
- **Device Type:** desktop, mobile, tablet, unknown

## 🔌 API Endpoints

### 1. Get All Active Sessions

```http
GET /api/v1/auth/sessions
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Sessions retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "deviceName": "Chrome on macOS",
      "deviceType": "desktop",
      "ipAddress": "192.168.1.1",
      "lastActivityAt": "2026-01-31T10:00:00.000Z",
      "createdAt": "2026-01-31T09:00:00.000Z",
      "expiresAt": "2026-02-07T09:00:00.000Z",
      "isCurrent": true
    },
    {
      "id": "987fcdeb-51a2-43f1-b234-56789abcdef0",
      "deviceName": "Safari on iOS",
      "deviceType": "mobile",
      "ipAddress": "192.168.1.2",
      "lastActivityAt": "2026-01-30T15:30:00.000Z",
      "createdAt": "2026-01-30T14:00:00.000Z",
      "expiresAt": "2026-02-06T14:00:00.000Z"
    }
  ],
  "meta": {
    "total_sessions": 2
  },
  "timestamp": "2026-01-31T10:00:00.000Z",
  "path": "/api/v1/auth/sessions"
}
```

### 2. Revoke Specific Session

```http
DELETE /api/v1/auth/sessions/revoke
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "sessionId": "987fcdeb-51a2-43f1-b234-56789abcdef0"
}
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Session revoked successfully",
  "timestamp": "2026-01-31T10:00:00.000Z",
  "path": "/api/v1/auth/sessions/revoke"
}
```

### 3. Revoke All Other Sessions

```http
DELETE /api/v1/auth/sessions/revoke-others
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentSessionId": "123e4567-e89b-12d3-a456-426614174000" // Optional
}
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "All other sessions revoked successfully",
  "data": {
    "revoked_count": 3
  },
  "timestamp": "2026-01-31T10:00:00.000Z",
  "path": "/api/v1/auth/sessions/revoke-others"
}
```

### 4. Logout From All Devices

```http
DELETE /api/v1/auth/sessions/logout-all
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Logged out from all devices successfully",
  "data": {
    "revoked_count": 5
  },
  "timestamp": "2026-01-31T10:00:00.000Z",
  "path": "/api/v1/auth/sessions/logout-all"
}
```

## 💻 Frontend Integration

### 1. Session Service (`client/lib/api/session.service.ts`)

```typescript
import { sessionService } from '@/lib/api';

// Get all sessions
const response = await sessionService.getSessions();
if (isSuccessResponse(response)) {
  const sessions = response.data;
}

// Revoke specific session
await sessionService.revokeSession(sessionId);

// Revoke all other sessions
await sessionService.revokeOtherSessions(currentSessionId);

// Logout from all devices
await sessionService.logoutAllDevices();
```

### 2. Session Management UI Example

```typescript
'use client';

import { useState, useEffect } from 'react';
import { sessionService } from '@/lib/api';
import { Session } from '@/interfaces';
import { isSuccessResponse } from '@/lib/utils';
import { toast } from '@/lib/utils';

export function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const response = await sessionService.getSessions();
    if (isSuccessResponse<Session[]>(response)) {
      setSessions(response.data);
    }
    setLoading(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    const response = await sessionService.revokeSession(sessionId);
    if (isSuccessResponse(response)) {
      toast.success('Session revoked successfully');
      await loadSessions();
    } else {
      toast.error(response.message);
    }
  };

  const handleLogoutAll = async () => {
    const response = await sessionService.logoutAllDevices();
    if (isSuccessResponse(response)) {
      toast.success(`Logged out from ${response.data.revoked_count} devices`);
      // Redirect to login
      window.location.href = '/auth/login';
    } else {
      toast.error(response.message);
    }
  };

  return (
    <div>
      <h2>Active Sessions</h2>
      {sessions.map((session) => (
        <div key={session.id} className="session-card">
          <div>
            <strong>{session.deviceName}</strong>
            <span>{session.deviceType}</span>
          </div>
          <div>
            <p>IP: {session.ipAddress}</p>
            <p>Last active: {new Date(session.lastActivityAt).toLocaleString()}</p>
          </div>
          {!session.isCurrent && (
            <button onClick={() => handleRevokeSession(session.id)}>
              Revoke
            </button>
          )}
        </div>
      ))}
      <button onClick={handleLogoutAll}>Logout from all devices</button>
    </div>
  );
}
```

## 🔐 Security Features

1. **Session Expiration**
   - Sessions expire after 7 days (matches refresh token expiration)
   - Automatic cleanup of expired sessions

2. **Device Tracking**
   - IP address logging
   - User agent parsing
   - Device type detection

3. **Last Activity Tracking**
   - Updated on token refresh
   - Helps identify inactive sessions

4. **Force Logout**
   - Invalidate all sessions at once
   - Useful for security incidents

## 🧪 Testing

### Postman/Insomnia

**1. Login to get access token**
```http
POST http://localhost:3001/api/v1/auth/login
```

**2. View sessions**
```http
GET http://localhost:3001/api/v1/auth/sessions
Authorization: Bearer <access_token>
```

**3. Test from multiple devices/browsers**
- Login from Chrome
- Login from Safari
- Login from mobile
- View all sessions
- Revoke specific session

**4. Force logout**
```http
DELETE http://localhost:3001/api/v1/auth/sessions/logout-all
Authorization: Bearer <access_token>
```

## 📊 Monitoring

### Database Queries

```sql
-- Check active sessions count per user
SELECT "userId", COUNT(*) as active_sessions
FROM sessions
WHERE "isActive" = true
GROUP BY "userId";

-- Find sessions about to expire
SELECT * FROM sessions
WHERE "expiresAt" < NOW() + INTERVAL '1 day'
AND "isActive" = true;

-- Find inactive sessions (no activity > 24 hours)
SELECT * FROM sessions
WHERE "lastActivityAt" < NOW() - INTERVAL '24 hours'
AND "isActive" = true;
```

## 🎯 Best Practices

1. **Regular Cleanup**
   - Cron jobs handle automatic cleanup
   - Expired sessions deleted after expiration
   - Inactive sessions removed after 30 days

2. **User Notifications**
   - Show toast when session is revoked
   - Redirect to login after force logout
   - Display session count in UI

3. **Security Considerations**
   - Always validate session on token refresh
   - Log session invalidation events
   - Implement rate limiting on session endpoints

4. **Performance**
   - Use indexes on userId and isActive
   - Cache active session count
   - Paginate session list for users with many devices

## 🚀 Future Enhancements

1. **Session Naming**
   - Allow users to name their devices
   - "John's iPhone", "Work Laptop", etc.

2. **Session Notifications**
   - Email when new device logs in
   - Push notification for new session

3. **Location Tracking**
   - Use IP to detect location
   - Show country/city in session list

4. **Trusted Devices**
   - Mark devices as trusted
   - Skip 2FA on trusted devices

## ✅ Implementation Checklist

- [x] Session entity created
- [x] Session service with CRUD operations
- [x] Device info extraction utility
- [x] Auth service integration
- [x] Session management endpoints
- [x] Database migration
- [x] Automatic cleanup (cron jobs)
- [x] Frontend session interface
- [x] Frontend session service
- [x] Swagger documentation
- [x] Comprehensive documentation

## 📝 Summary

This implementation provides:

✅ **Complete session tracking** - Every login creates a session
✅ **Multi-device support** - Users can see all logged-in devices
✅ **Granular control** - Revoke specific sessions or all at once
✅ **Automatic cleanup** - Expired/inactive sessions removed
✅ **Security** - IP and device tracking for audit trail
✅ **User-friendly** - Clear device names and last activity
✅ **Production-ready** - Cron jobs, indexes, proper error handling

The system is fully functional and ready for production use!
