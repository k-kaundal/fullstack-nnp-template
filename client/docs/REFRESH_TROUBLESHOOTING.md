# Page Refresh Troubleshooting Guide

## Issue: User Gets Logged Out on Page Refresh

### Root Causes & Fixes

#### 1. **Token Expiration During Initialization** ✅ FIXED
**Problem:** Access token expires between page close and page refresh.

**Solution:**
- Check token expiration on page load
- Automatically refresh token if expired or expiring soon (2 min buffer)
- Use stored refresh token directly for initial refresh (don't depend on state)

**Code:**
```typescript
// In auth-provider.tsx initAuth()
if (isTokenExpiring(storedAccessToken)) {
  // Use stored refresh token directly
  const response = await authService.refreshToken(storedRefreshToken);
  // Update tokens and restore session
}
```

#### 2. **Race Condition in Token Refresh** ✅ FIXED
**Problem:** Multiple API calls trigger simultaneous token refresh attempts.

**Solution:**
- Implement request queue in API client
- Use `isRefreshing` flag to prevent duplicate refreshes
- Queue pending requests during refresh, retry after success

**Code:**
```typescript
// In client.ts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

if (isRefreshing) {
  // Queue this request
  return new Promise((resolve) => {
    subscribeTokenRefresh((token) => {
      // Retry with new token
    });
  });
}
```

#### 3. **Session Validation Loop** ✅ FIXED
**Problem:** Validating session during initialization triggers 401, which causes infinite refresh loop.

**Solution:**
- Skip session validation during initial load
- Only validate after tokens are successfully restored/refreshed
- Set `isInitializing` flag to prevent validation during startup

**Code:**
```typescript
setIsInitializing(true);
// Restore tokens...
setupTokenRefresh();
setupSessionValidation();
setIsInitializing(false);
```

#### 4. **State Not Updated Before Refresh** ✅ FIXED
**Problem:** `refreshAccessToken()` depends on `refreshToken` state, but state not set before calling.

**Solution:**
- Set refresh token state immediately after loading from storage
- Or call auth service directly with stored refresh token (bypassing state)

**Fixed Implementation:**
```typescript
// Restore refresh token state first
setRefreshToken(storedRefreshToken);

// Then try to refresh
const response = await authService.refreshToken(storedRefreshToken);
```

---

## Testing Checklist

### Manual Tests
- [ ] **Fresh Login** → Refresh page immediately → Should stay logged in
- [ ] **Token Expired** → Refresh page → Should auto-refresh and stay logged in
- [ ] **Token Expiring Soon** → Refresh page → Should proactively refresh
- [ ] **No Refresh Token** → Refresh page → Should redirect to login
- [ ] **Invalid Refresh Token** → Refresh page → Should redirect to login
- [ ] **Multiple Tabs** → Refresh one tab → Both tabs should stay logged in
- [ ] **Network Error** → Refresh during offline → Should handle gracefully

### Automated Tests
```typescript
describe('Auth Provider Refresh Logic', () => {
  it('should restore auth state on page load', async () => {
    localStorage.setItem('accessToken', validToken);
    localStorage.setItem('refreshToken', validRefreshToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should refresh expired token on page load', async () => {
    const expiredToken = generateExpiredToken();
    localStorage.setItem('accessToken', expiredToken);
    localStorage.setItem('refreshToken', validRefreshToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(authService.refreshToken).toHaveBeenCalled();
      expect(result.current.user).toBeTruthy();
    });
  });
});
```

---

## Debugging Tools

### 1. **Console Logging** (Development Only)
Add temporary logging to track token refresh flow:

```typescript
// In auth-provider.tsx initAuth()
console.log('[AUTH] Initializing auth state');
console.log('[AUTH] Stored access token:', storedAccessToken ? 'EXISTS' : 'NONE');
console.log('[AUTH] Token expiring:', isTokenExpiring(storedAccessToken));

// In client.ts refresh interceptor
console.log('[API] 401 detected, attempting refresh');
console.log('[API] Already refreshing:', isRefreshing);
console.log('[API] Refresh successful, retrying original request');
```

**⚠️ IMPORTANT:** Remove all console.log statements before committing (ESLint will error).

### 2. **Browser DevTools - Network Tab**
Monitor API requests during page refresh:

1. Open DevTools → Network tab
2. Enable "Preserve log"
3. Refresh the page
4. Look for:
   - `/auth/refresh` request (should be called if token expired)
   - Original failed request (should show 401)
   - Retried request (should show 200 with new token)

### 3. **Browser DevTools - Application Tab**
Check localStorage:

1. Open DevTools → Application tab
2. Storage → Local Storage → your domain
3. Verify keys exist:
   - `accessToken` (JWT string)
   - `refreshToken` (JWT string)
   - `user` (JSON string)
   - `sessionId` (UUID string)

### 4. **JWT Token Inspector**
Decode tokens to check expiration:

```bash
# In browser console
const token = localStorage.getItem('accessToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires at:', new Date(payload.exp * 1000));
console.log('Is expired:', Date.now() > payload.exp * 1000);
```

Or use: https://jwt.io/

---

## Common Error Messages

### "No refresh token available"
**Cause:** Refresh token missing from localStorage

**Solutions:**
- User needs to login again
- Check if logout cleared tokens
- Verify token is being saved on login

### "Token refresh failed"
**Cause:** Refresh token expired or invalid

**Solutions:**
- Redirect user to login page
- Clear all auth data
- Check if backend session was invalidated

### "Network error during token refresh"
**Cause:** API server unreachable

**Solutions:**
- Show offline indicator
- Queue requests for retry
- Allow user to manually retry

### "Invalid token format"
**Cause:** Malformed JWT in localStorage

**Solutions:**
- Clear all auth data
- Redirect to login
- Add token validation before use

---

## Flow Diagrams

### Page Refresh Flow (Success Case)
```
User refreshes page (F5)
    ↓
Load from localStorage
    ├─ accessToken
    ├─ refreshToken
    ├─ user
    └─ sessionId
    ↓
Check token expiration
    ↓
Is token expiring? ───YES──→ Call /auth/refresh
    │                              ↓
    NO                         Get new tokens
    │                              ↓
    ↓                         Update localStorage
Set auth state                     ↓
    ↓                         Set auth state
    └──────────────────────────────┘
                 ↓
    Setup auto-refresh interval (13 min)
                 ↓
    Setup validation interval (5 min)
                 ↓
         User stays logged in ✅
```

### Token Refresh Flow (During API Call)
```
User makes API request
    ↓
API returns 401 Unauthorized
    ↓
Is already refreshing? ───YES──→ Queue this request
    │                                   ↓
    NO                           Wait for refresh
    │                                   ↓
    ↓                            Retry with new token
Set isRefreshing = true
    ↓
Call /auth/refresh
    ↓
Success? ───NO──→ Clear auth & redirect
    │
    YES
    ↓
Save new tokens
    ↓
Notify queued requests
    ↓
Set isRefreshing = false
    ↓
Retry original request ✅
```

---

## Configuration Options

### Token Refresh Timing
```typescript
// client/lib/providers/auth-provider.tsx

// Access token lifetime: 15 minutes (backend)
// Refresh interval: 13 minutes (2 min buffer)
const TOKEN_REFRESH_INTERVAL = 13 * 60 * 1000;

// Session validation: 5 minutes
const SESSION_VALIDATION_INTERVAL = 5 * 60 * 1000;

// Token expiration buffer: 2 minutes
const TOKEN_EXPIRATION_BUFFER = 2; // minutes
```

**Adjust these if:**
- Backend token expiration changes
- Network latency requires more buffer
- More/less frequent validation needed

### Storage Keys
```typescript
// client/enums/common.enum.ts
export enum StorageKey {
  ACCESS_TOKEN = 'accessToken',
  REFRESH_TOKEN = 'refreshToken',
  USER_DATA = 'user',
  SESSION_ID = 'sessionId',
}
```

**Custom prefix:**
```typescript
const PREFIX = 'myapp_';
export enum StorageKey {
  ACCESS_TOKEN = `${PREFIX}accessToken`,
  // ...
}
```

---

## Security Considerations

### LocalStorage vs HttpOnly Cookies

**Current: localStorage** (easier for SPA)
- ✅ Simple to implement
- ✅ Works with any backend
- ❌ Vulnerable to XSS attacks
- ❌ Accessible to JavaScript

**Recommended for Production: httpOnly cookies**
- ✅ Not accessible to JavaScript (XSS protection)
- ✅ Automatically sent with requests
- ❌ Requires backend CORS configuration
- ❌ More complex for mobile apps

**Migration to httpOnly cookies:**
```typescript
// Backend: Set cookie instead of returning token
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: true, // HTTPS only
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// Frontend: Remove manual token handling
// Tokens automatically sent in cookie header
```

### XSS Protection
Current mitigations:
- Content Security Policy (CSP)
- Input sanitization
- React's built-in XSS protection

**Additional measures:**
- Use httpOnly cookies for tokens
- Implement DOMPurify for user content
- Enable strict CSP headers

---

## Performance Optimization

### Reduce API Calls During Initialization
**Current:** Token refresh + Session validation = 2 API calls

**Optimization:** Combined endpoint
```typescript
// Backend: /auth/validate-and-refresh
// Returns: user data + new tokens (if needed)

// Frontend: Single call on page load
const response = await authService.validateAndRefresh();
```

### Debounce Token Refresh
Already implemented via `isRefreshing` flag and request queue.

### Minimize Re-renders
Use `useRef` for intervals (already implemented):
```typescript
const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);
```

---

## Browser Compatibility

### localStorage Support
- ✅ Chrome/Edge 4+
- ✅ Firefox 3.5+
- ✅ Safari 4+
- ✅ iOS Safari 4+
- ✅ Android Browser 2.1+

### Fallback for No localStorage
```typescript
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Use sessionStorage or memory fallback
const storage = isLocalStorageAvailable()
  ? localStorage
  : sessionStorage;
```

---

## Related Documentation
- 📄 [Session Management (Backend)](../../server/docs/SESSION_MANAGEMENT.md)
- 📄 [Session Management (Client)](./SESSION_MANAGEMENT.md)
- 📄 [API Client Documentation](./API_CLIENT.md)
- 📄 [Auth Provider Documentation](./AUTH_PROVIDER.md)

---

## Support

If issues persist after following this guide:
1. Check backend logs for token validation errors
2. Verify database session records
3. Test with fresh login (clear all storage)
4. Enable verbose logging (development only)
5. Check network tab for API errors

**Last Updated:** 2026-01-31
**Status:** All known refresh issues resolved ✅
