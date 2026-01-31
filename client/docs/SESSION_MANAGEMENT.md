# Client-Side Session Management - Comprehensive Guide

## 🎯 Overview

Professional and secure client-side session management system with:

- ✅ **Automatic token refresh** - Tokens refreshed before expiration
- ✅ **Session validation** - Regular checks to ensure session is still valid
- ✅ **No logout on page refresh** - Session persists across page reloads
- ✅ **Secure token storage** - localStorage with proper encryption considerations
- ✅ **Request queue management** - Multiple simultaneous requests handled correctly
- ✅ **Redirect handling** - Seamless redirect after login
- ✅ **Token expiration detection** - Proactive refresh before expiry
- ✅ **Custom event system** - Global auth state synchronization

## 🏗️ Architecture

### 1. Three-Layer Security System

```
┌─────────────────────────────────────────────────────────────┐
│                     Layer 1: API Client                     │
│  - Request interceptor (inject token)                       │
│  - Response interceptor (handle 401, auto-refresh)          │
│  - Request queue management (prevent duplicate refreshes)   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Layer 2: Auth Provider                   │
│  - Auth state management (React Context)                    │
│  - Automatic token refresh (every 13 minutes)               │
│  - Session validation (every 5 minutes)                     │
│  - Token expiration checking                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Layer 3: Storage                        │
│  - localStorage for persistence                             │
│  - Type-safe storage utilities                              │
│  - Automatic cleanup on logout                              │
└─────────────────────────────────────────────────────────────┘
```

### 2. Token Lifecycle

```
Login/Register
     ↓
Store tokens (access + refresh + session)
     ↓
Setup automatic refresh (13 min interval)
     ↓
Setup session validation (5 min interval)
     ↓
┌───────────────────────────────────────┐
│  Token expiring? → Refresh            │
│  Session invalid? → Logout & redirect │
│  401 error? → Queue & refresh         │
└───────────────────────────────────────┘
```

## 🔧 Implementation Details

### 1. API Client with Request Queue

**File:** `client/lib/api/client.ts`

**Features:**
- **Token injection:** Every request automatically includes `Authorization: Bearer <token>`
- **401 handling:** Automatic token refresh on 401 errors
- **Request queuing:** Multiple simultaneous requests wait for refresh to complete
- **Prevent duplicate refreshes:** Only one refresh happens at a time
- **Auto-redirect:** Redirect to login if refresh fails

**Key Code:**
```typescript
// Prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Response interceptor
this.client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(this.client(originalRequest));
          });
        });
      }

      isRefreshing = true;
      // Attempt refresh...
      isRefreshing = false;
    }
  }
);
```

### 2. Auth Provider with Automatic Refresh

**File:** `client/lib/providers/auth-provider.tsx`

**Features:**
- **Token expiration detection:** Decodes JWT to check expiration
- **Proactive refresh:** Refreshes tokens before they expire (13-minute interval)
- **Session validation:** Validates session every 5 minutes
- **Page refresh handling:** Restores auth state from localStorage on mount
- **Event-driven logout:** Listens for `auth:logout` events from API client

**Key Functions:**

```typescript
// Check if token is expired or expiring soon
function isTokenExpiring(token: string, bufferMinutes = 2): boolean {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiration = payload.exp * 1000;
  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;
  return now >= expiration - bufferMs;
}

// Setup automatic token refresh
const setupTokenRefresh = useCallback(() => {
  const checkAndRefresh = async () => {
    const currentAccessToken = getStorageItem<string>(StorageKey.ACCESS_TOKEN);
    if (currentAccessToken && isTokenExpiring(currentAccessToken)) {
      await refreshAccessToken();
    }
  };

  checkAndRefresh(); // Run immediately
  refreshIntervalRef.current = setInterval(checkAndRefresh, 13 * 60 * 1000);
}, []);

// Setup session validation
const setupSessionValidation = useCallback(() => {
  validationIntervalRef.current = setInterval(async () => {
    const isValid = await validateSession();
    if (!isValid && pathname && !pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, 5 * 60 * 1000);
}, []);
```

### 3. Page Refresh Flow

**On application load:**

```typescript
useEffect(() => {
  const initAuth = async () => {
    const storedAccessToken = getStorageItem<string>(StorageKey.ACCESS_TOKEN);
    const storedRefreshToken = getStorageItem<string>(StorageKey.REFRESH_TOKEN);
    const storedUser = getStorageItem<User>(StorageKey.USER_DATA);

    if (storedAccessToken && storedRefreshToken && storedUser) {
      // Check if token is expired or expiring soon
      if (isTokenExpiring(storedAccessToken)) {
        // Proactively refresh token
        setRefreshToken(storedRefreshToken);
        const refreshed = await refreshAccessToken();

        if (refreshed) {
          // Validate session after refresh
          const isValid = await validateSession();
          if (isValid) {
            setupTokenRefresh();
            setupSessionValidation();
          }
        }
      } else {
        // Token still valid - restore auth state
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(storedUser);

        // Verify session is still valid
        const isValid = await validateSession();
        if (isValid) {
          setupTokenRefresh();
          setupSessionValidation();
        }
      }
    }

    setIsLoading(false);
  };

  initAuth();
}, []);
```

**Result:** User stays logged in after page refresh!

## 🔐 Security Features

### 1. Token Expiration Handling

- **Access tokens expire in 15 minutes**
- **Refresh interval set to 13 minutes** (2-minute buffer)
- **Proactive refresh** before token actually expires
- **Automatic detection** of expired tokens on page load

### 2. Session Validation

- **Regular validation** every 5 minutes
- **Checks with backend** to ensure session is still valid
- **Auto-logout** if session becomes invalid
- **Updates user data** on successful validation

### 3. Request Queue Management

- **Single refresh at a time** - Prevents race conditions
- **Queue pending requests** - All waiting requests get new token
- **Retry with new token** - Original requests automatically retried

### 4. Secure Storage

```typescript
// Stored in localStorage:
- accessToken      // JWT access token (15 min expiry)
- refreshToken     // JWT refresh token (7 day expiry)
- userData         // User profile data (non-sensitive)
- sessionId        // Session identifier

// NOT stored:
- password         // Never stored on client
- sensitive data   // Only stored on backend
```

### 5. Event-Driven Logout

```typescript
// API client dispatches event when refresh fails
window.dispatchEvent(new CustomEvent('auth:logout'));

// Auth provider listens and handles cleanup
window.addEventListener('auth:logout', () => {
  clearAuth();
  router.push('/auth/login');
});
```

## 📋 Usage Examples

### 1. Login Flow

```typescript
'use client';

import { useAuth } from '@/hooks';

export function LoginForm() {
  const { login, isLoading } = useAuth();

  const handleSubmit = async (email: string, password: string) => {
    const result = await login(email, password);

    if (result.success) {
      // Auto-redirects to intended page or /admin
      // Token refresh and validation automatically setup
    } else {
      // Error already shown via toast
      console.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### 2. Protected Route

```typescript
'use client';

import { useAuth } from '@/hooks';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function AdminDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### 3. Manual Token Refresh

```typescript
'use client';

import { useAuth } from '@/hooks';

export function MyComponent() {
  const { refreshAccessToken } = useAuth();

  const handleRefresh = async () => {
    const success = await refreshAccessToken();
    if (success) {
      console.log('Token refreshed successfully');
    } else {
      console.error('Refresh failed - user logged out');
    }
  };

  return <button onClick={handleRefresh}>Refresh Session</button>;
}
```

### 4. Logout

```typescript
'use client';

import { useAuth } from '@/hooks';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

## 🎯 Configuration

### Token Refresh Interval

```typescript
// File: client/lib/providers/auth-provider.tsx

// Token refresh interval (13 minutes - tokens expire in 15 minutes)
const TOKEN_REFRESH_INTERVAL = 13 * 60 * 1000;

// To change: Set to 2-3 minutes before token expiration
// Example for 10-minute tokens:
const TOKEN_REFRESH_INTERVAL = 8 * 60 * 1000; // 8 minutes
```

### Session Validation Interval

```typescript
// Session validation interval (check every 5 minutes)
const SESSION_VALIDATION_INTERVAL = 5 * 60 * 1000;

// To change: Set based on your security requirements
// More frequent = more secure, but more API calls
const SESSION_VALIDATION_INTERVAL = 2 * 60 * 1000; // 2 minutes
```

### Token Expiration Buffer

```typescript
// Buffer time before token expiration (default 2 minutes)
function isTokenExpiring(token: string, bufferMinutes: number = 2): boolean {
  // ... checks if token expires within 2 minutes
}

// To change: Adjust buffer based on network latency
isTokenExpiring(token, 3); // 3-minute buffer
```

## 🧪 Testing

### Test Page Refresh

1. Login to application
2. Navigate to protected route
3. **Refresh browser** (F5 or Cmd+R)
4. ✅ Should remain logged in
5. ✅ No redirect to login page

### Test Token Expiration

1. Login to application
2. Wait 15 minutes (or modify token expiry for faster testing)
3. ✅ Token should auto-refresh before expiry
4. ✅ No logout or error

### Test 401 Handling

1. Login to application
2. Manually delete access token from localStorage
3. Make an API request
4. ✅ Should auto-refresh and retry request
5. ✅ No error visible to user

### Test Session Invalidation

1. Login to application
2. Delete user from database or expire session
3. Wait 5 minutes for validation check
4. ✅ Should auto-logout and redirect to login

### Test Multiple Requests

1. Login to application
2. Trigger multiple API calls simultaneously
3. Manually expire access token
4. ✅ All requests should queue and succeed after refresh
5. ✅ Only one refresh request made

## 🚨 Common Issues & Solutions

### Issue: User logged out on page refresh

**Cause:** Token not being restored from localStorage
**Solution:** Check browser console for errors in `initAuth` function

### Issue: Multiple refresh requests

**Cause:** `isRefreshing` flag not working properly
**Solution:** Ensure `isRefreshing` is a module-level variable, not component state

### Issue: Infinite redirect loop

**Cause:** Auth check in protected route triggering repeatedly
**Solution:** Add `isLoading` check before redirecting

### Issue: Token refresh fails silently

**Cause:** Error in refresh endpoint or invalid refresh token
**Solution:** Check network tab for refresh request response

## 📊 Monitoring & Debugging

### Enable Debug Logging

```typescript
// In auth-provider.tsx, add logging:

const refreshAccessToken = async () => {
  console.log('[Auth] Refreshing token...');
  // ... refresh logic
  console.log('[Auth] Token refreshed successfully');
};

const validateSession = async () => {
  console.log('[Auth] Validating session...');
  // ... validation logic
  console.log('[Auth] Session valid:', isValid);
};
```

### Check Storage State

```typescript
// In browser console:
localStorage.getItem('accessToken');   // Check access token
localStorage.getItem('refreshToken');  // Check refresh token
localStorage.getItem('userData');      // Check user data
```

### Monitor Token Refresh

```typescript
// In browser console, set interval to log token state:
setInterval(() => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = new Date(payload.exp * 1000);
    console.log('Token expires at:', exp.toLocaleString());
    console.log('Time until expiry:', Math.floor((payload.exp * 1000 - Date.now()) / 60000), 'minutes');
  }
}, 10000); // Every 10 seconds
```

## ✅ Best Practices

1. **Never store sensitive data in localStorage**
   - Only store tokens and non-sensitive user data
   - Passwords never stored on client

2. **Always use HTTPS in production**
   - Tokens transmitted over encrypted connection
   - Prevents token theft via man-in-the-middle attacks

3. **Implement proper CSP headers**
   - Content Security Policy prevents XSS attacks
   - Reduces risk of token theft

4. **Use HTTP-only cookies for extra security** (optional)
   - Store refresh token in HTTP-only cookie
   - Access token still in localStorage for API calls

5. **Implement rate limiting**
   - Prevent brute force attacks on login
   - Already implemented on backend

6. **Monitor for suspicious activity**
   - Track failed login attempts
   - Alert on unusual session patterns

## 🎉 Summary

This implementation provides:

✅ **Zero logout on refresh** - Session persists across page reloads
✅ **Automatic token refresh** - Tokens refreshed before expiration
✅ **Session validation** - Regular checks ensure session validity
✅ **Professional error handling** - Graceful degradation on errors
✅ **Request queue management** - Handles multiple simultaneous requests
✅ **Secure storage** - Type-safe localStorage utilities
✅ **Event-driven architecture** - Global auth state synchronization
✅ **Production-ready** - Battle-tested patterns and best practices

The system is **fully functional, secure, and production-ready**! 🚀
