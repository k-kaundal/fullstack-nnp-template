# Authentication API Endpoints - cURL Examples

## 📚 Documentation Index

- **[API Security Implementation](./API_SECURITY.md)** - Complete JWT authentication security guide
- **[Complete Validation Guide](./VALIDATION.md)** - Comprehensive validation rules and security features
- **[Implementation Status](./VALIDATION_IMPLEMENTATION_COMPLETE.md)** - Validation implementation summary

## 🔒 Security Notice

**All Users API endpoints (`/api/v1/users/*`) now require JWT authentication!**

Public endpoints (no token required):

- ✅ POST `/auth/register` - User registration
- ✅ POST `/auth/login` - User login
- ✅ POST `/auth/refresh` - Refresh access token
- ✅ POST `/auth/forgot-password` - Request password reset
- ✅ POST `/auth/reset-password` - Reset password
- ✅ POST `/auth/verify-email` - Verify email
- ✅ GET `/` - Health check

Protected endpoints (JWT token required):

- 🔒 POST `/auth/logout` - Logout
- 🔒 POST `/auth/resend-verification` - Resend verification
- 🔒 GET `/auth/me` - Get current user
- 🔒 ALL `/users/*` endpoints

See [API_SECURITY.md](./API_SECURITY.md) for complete authentication guide.

---

## ✅ Validation Features

All authentication endpoints have enterprise-grade validation:

- 🛡️ **Disposable email blocking** (8 providers blacklisted)
- 🔒 **Strong password enforcement** (complexity + weak password detection)
- ✏️ **Name format validation** (letters, spaces, hyphens, apostrophes)
- 🎫 **Token format validation** (hexadecimal format)
- 📏 **Length constraints** on all input fields

See [VALIDATION.md](./VALIDATION.md) for complete details.

---

## Base URL

```
http://localhost:3001/api/v1
```

## 1. Register New User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "SecurePass123!"
  }'
```

**Rate Limit**: 5 requests/minute

**Validation Rules**:

- ✅ Email: Valid format, no disposable providers (tempmail.com, guerrillamail.com, etc.)
- ✅ First/Last Name: 2-50 characters, letters/spaces/hyphens/apostrophes only, must start with letter
- ✅ Password: 8-100 characters, must have uppercase, lowercase, number, special char (@$!%\*?&), no weak passwords

**Response**:

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "isEmailVerified": false
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Rate Limit**: 10 requests/minute

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 3. Get Current User Profile

```bash
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Authentication**: Required

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "User profile retrieved successfully",
  "data": {
    "sub": "123e4567-e89b-12d3-a456-426614174000",
    "email": "john.doe@example.com"
  }
}
```

---

## 4. Refresh Access Token

```bash
curl -X POST http://localhost:3001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Rate Limit**: 20 requests/minute

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 5. Logout

```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Authentication**: Required

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Logout successful",
  "data": null,
  "meta": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "logged_out_at": "2026-01-31T10:00:00.000Z"
  }
}
```

---

## 6. Forgot Password (Request Reset)

```bash
curl -X POST http://localhost:3001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Rate Limit**: 3 requests/hour

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "data": null
}
```

---

## 7. Reset Password

```bash
curl -X POST http://localhost:3001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "newPassword": "NewSecurePass123!"
  }'
```

**Rate Limit**: 5 requests/hour

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Password reset successful. Please login with your new password.",
  "data": null,
  "meta": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "password_reset_at": "2026-01-31T10:00:00.000Z"
  }
}
```

---

## 8. Verify Email

```bash
curl -X POST http://localhost:3001/api/v1/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL"
  }'
```

**Rate Limit**: 5 requests/hour

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Email verified successfully",
  "data": null,
  "meta": {
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "verified_at": "2026-01-31T10:00:00.000Z"
  }
}
```

---

## 9. Resend Verification Email

```bash
curl -X POST http://localhost:3001/api/v1/auth/resend-verification \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Authentication**: Required
**Rate Limit**: 3 requests/hour

**Response**:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Verification email sent successfully",
  "data": null,
  "meta": {
    "email_sent_at": "2026-01-31T10:00:00.000Z"
  }
}
```

---

## Postman Collection

You can import these into Postman by creating a new collection with the following structure:

### Environment Variables

```json
{
  "baseUrl": "http://localhost:3001/api/v1",
  "accessToken": "",
  "refreshToken": ""
}
```

### Pre-request Script (for authenticated endpoints)

```javascript
const accessToken = pm.environment.get('accessToken');
if (accessToken) {
  pm.request.headers.add({
    key: 'Authorization',
    value: `Bearer ${accessToken}`,
  });
}
```

### Test Script (to save tokens after login/register)

```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
  const response = pm.response.json();
  if (response.data && response.data.accessToken) {
    pm.environment.set('accessToken', response.data.accessToken);
  }
  if (response.data && response.data.refreshToken) {
    pm.environment.set('refreshToken', response.data.refreshToken);
  }
}
```

---

## Common Error Responses

### 400 Bad Request - Validation Error

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Validation failed",
  "errors": ["Password must be at least 8 characters long"]
}
```

### 401 Unauthorized - Invalid Credentials

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

### 401 Unauthorized - Token Expired

```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 409 Conflict - User Already Exists

```json
{
  "status": "error",
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

### 429 Too Many Requests - Rate Limit

```json
{
  "status": "error",
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Testing Workflow

1. **Register** a new user → Save `accessToken` and `refreshToken`
2. **Login** with credentials → Update tokens
3. **Get Profile** using `accessToken` → Verify authentication
4. **Refresh Token** when `accessToken` expires → Get new tokens
5. **Logout** → Token is blacklisted
6. **Forgot Password** → Request reset link (check email)
7. **Reset Password** with token → Password updated
8. **Verify Email** with token → Email verified

---

## Swagger Documentation

Interactive API documentation available at:
**http://localhost:3001/api**

- Try endpoints directly from browser
- See request/response examples
- Test authentication flows
- View complete API schema
