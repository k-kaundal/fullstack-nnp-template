# Client Architecture Documentation

## Overview

This is a production-ready Next.js 16 frontend architecture with TypeScript, featuring a scalable folder structure, type-safe API client, and comprehensive component library.

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.9+ (strict mode, no `any` types)
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios with custom wrapper
- **State Management**: React hooks (useState, useCallback, useEffect)

## Folder Structure

```
client/
├── app/                          # Next.js App Router
│   ├── users/                    # Example feature page
│   │   └── page.tsx
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # Reusable components
│   ├── ui/                       # Generic UI components
│   │   ├── LoadingSpinner.tsx
│   │   ├── ErrorMessage.tsx
│   │   ├── Pagination.tsx
│   │   └── index.ts              # Barrel export
│   └── user/                     # Feature-specific components
│       ├── UserCard.tsx
│       └── index.ts
│
├── lib/                          # Core library code
│   ├── api/                      # API client and services
│   │   ├── client.ts             # Axios wrapper with interceptors
│   │   ├── users.service.ts      # Users API service
│   │   └── index.ts
│   └── utils/                    # Utility functions
│       ├── api-response.ts       # Response helpers
│       ├── storage.ts            # localStorage wrapper
│       ├── validation.ts         # Validation helpers
│       └── index.ts
│
├── hooks/                        # Custom React hooks
│   ├── useUsers.ts               # Users CRUD hook
│   └── index.ts
│
├── interfaces/                   # TypeScript interfaces
│   ├── user.interface.ts         # User-related interfaces
│   ├── auth.interface.ts         # Auth-related interfaces
│   └── index.ts
│
├── types/                        # TypeScript type definitions
│   ├── api.types.ts              # API response types
│   └── index.ts
│
├── enums/                        # TypeScript enums
│   ├── common.enum.ts            # Common enums (HttpStatus, ApiStatus)
│   └── index.ts
│
├── constants/                    # Application constants
│   ├── common.ts                 # API config, pagination, etc.
│   └── index.ts
│
├── docs/                         # Documentation
│   └── CLIENT_ARCHITECTURE.md    # This file
│
├── .env.local                    # Environment variables (not committed)
├── .env.example                  # Environment template
├── package.json
├── tsconfig.json                 # TypeScript config
└── next.config.ts                # Next.js config
```

## Key Features

### 1. Layout Architecture

**Admin Layout (`app/admin/layout.tsx`):**

- Wraps all admin pages automatically
- Includes sidebar navigation with menu items
- Admin header with profile and logout buttons
- Protected routes requiring authentication
- Dark sidebar with professional styling

**Public Layout (Root `app/layout.tsx`):**

- Wraps all public pages
- Minimal navigation for unauthenticated users
- No authentication required
- Clean, simple design

**Route Groups:**

- `(public)` folder groups public pages without adding URL segment
- `admin` folder adds `/admin` prefix to URLs

### 2. Type-Safe API Client

The API client (`lib/api/client.ts`) provides:

- Automatic token injection from localStorage
- Request/response interceptors
- Global error handling
- Type-safe HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Automatic redirect on 401 (unauthorized)

**Example Usage:**

```typescript
import { apiClient } from '@/lib/api';
import { User } from '@/interfaces';

const response = await apiClient.get<User[]>('/users', { page: 1, limit: 10 });
if (response.status === 'success') {
  console.log(response.data); // User[]
}
```

### 2. Service Layer

Feature-specific services encapsulate API calls:

```typescript
import { usersService } from '@/lib/api';

const response = await usersService.getAll(1, 10);
```

### 3. Custom Hooks

React hooks manage state and API operations:

```typescript
import { useUsers } from '@/hooks';

function UsersPage() {
  const { users, isLoading, error, fetchUsers, createUser } = useUsers();

  useEffect(() => {
    fetchUsers(1, 10);
  }, [fetchUsers]);

  return <div>{/* UI */}</div>;
}
```

### 4. Reusable Components

UI components with TypeScript props:

```typescript
import { LoadingSpinner, ErrorMessage, Pagination } from '@/components/ui';

{isLoading && <LoadingSpinner size="lg" />}
{error && <ErrorMessage message={error} onRetry={handleRetry} />}
{pagination && <Pagination meta={pagination} onPageChange={handlePageChange} />}
```

## API Response Structure

All API responses follow a standardized format matching the backend:

**Success Response:**

```typescript
{
  status: 'success',
  statusCode: 200,
  message: 'Users fetched successfully',
  data: [...],
  meta: {
    total: 25,
    page: 1,
    limit: 10,
    total_pages: 3,
    has_next: true,
    has_previous: false
  },
  timestamp: '2026-01-27T10:00:00.000Z',
  path: '/api/v1/users'
}
```

**Error Response:**

```typescript
{
  status: 'error',
  statusCode: 400,
  message: 'Validation failed',
  errors: ['Email is required'],
  timestamp: '2026-01-27T10:00:00.000Z',
  path: '/api/v1/users'
}
```

## Type Safety

### No `any` Types

The entire codebase uses strict TypeScript with **zero `any` types**:

```typescript
// ❌ BAD - Never use 'any'
function fetchData(): Promise<any> { ... }

// ✅ GOOD - Use proper types or generics
function fetchData<T>(): Promise<ApiSuccessResponse<T> | ApiErrorResponse> { ... }
```

### Generic Types

Use generics for flexibility:

```typescript
async get<T = ResponseBody>(url: string): Promise<ApiSuccessResponse<T> | ApiErrorResponse>
```

### Type Guards

Use type guards for runtime type checking:

```typescript
import { isSuccessResponse, isErrorResponse } from '@/lib/utils';

const response = await apiClient.get('/users');
if (isSuccessResponse<User[]>(response)) {
  console.log(response.data); // TypeScript knows this is User[]
}
```

## Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

Access in code:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

## Constants Management

Centralize constants in `constants/` folder:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;
```

## Storage Management

Use type-safe localStorage wrapper:

```typescript
import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/utils';
import { StorageKey } from '@/enums';

// Store data
setStorageItem<User>(StorageKey.USER_DATA, userData);

// Retrieve data
const user = getStorageItem<User>(StorageKey.USER_DATA);

// Remove data
removeStorageItem(StorageKey.AUTH_TOKEN);
```

## Validation

Use validation utilities:

```typescript
import { isValidEmail, isValidPassword, getPasswordStrength } from '@/lib/utils';

if (!isValidEmail(email)) {
  setError('Invalid email format');
}

if (!isValidPassword(password)) {
  setError('Password must contain uppercase, lowercase, number, and special character');
}

const strength = getPasswordStrength(password); // 'weak' | 'medium' | 'strong'
```

## Routing

Next.js App Router structure with admin and public sections:

```
app/
├── page.tsx                    # Home: /
├── layout.tsx                  # Root layout (public)
├── admin/
│   ├── layout.tsx             # Admin layout (sidebar + header)
│   ├── page.tsx               # Admin dashboard: /admin
│   └── users/
│       ├── page.tsx           # Users list: /admin/users
│       └── [id]/
│           └── page.tsx       # User details: /admin/users/:id
└── (public)/
    ├── about/
    │   └── page.tsx           # About: /about
    └── contact/
        └── page.tsx           # Contact: /contact
```

**Layout Hierarchy:**

- Public pages → Root layout
- Admin pages → Root layout + Admin layout (nested)

## Best Practices

### 1. Component Organization

- **UI components**: Generic, reusable (buttons, inputs, modals)
- **Feature components**: Specific to a feature (UserCard, PostForm)
- Always use TypeScript interfaces for props
- Add JSDoc comments for complex components
- **Never use console.log in production code**

### 2. Server vs Client Components

- **Default to Server Components** for better performance
- Use 'use client' ONLY when you need:
  - State management (useState, useReducer)
- **All state variables must be typed - no `any` types**
  - Event handlers (onClick, onChange)
  - Browser APIs (localStorage, window)
  - React hooks (useEffect, useCallback)

### 3. Layout Structure

- Admin pages automatically get admin layout with sidebar
- Public pages get minimal root layout
- Use route groups `(public)` to organize without URL changes

### 2. State Management

- Use `useState` for local state
- Use custom hooks for shared logic
- Keep state close to where it's used
- Avoid prop drilling (consider Context API for deeply nested state)

### 3. Error Handling

```typescript
try {
  const response = await apiClient.get('/users');
  if (isSuccessResponse<User[]>(response)) {
    // Handle success
  } else {
    // Handle API error
    console.error(response.message);
  }
} catch (error) {
  // Handle network/unexpected error
  console.error('Unexpected error:', error);
}
```

### 4. Loading States

Always show loading indicators:

```typescript
{isLoading && <LoadingSpinner />}
{!isLoading && data && <DataDisplay data={data} />}
```

### 5. Barrel Exports

Use `index.ts` files for cleaner imports:

```typescript
// ❌ Without barrel exports
import { UserCard } from '@/components/user/UserCard';
import { UserForm } from '@/components/user/UserForm';

// ✅ With barrel exports
import { UserCard, UserForm } from '@/components/user';
```

## Code Standards

### ESLint & Prettier

```bash
yarn lint          # Check for linting errors
yarn format        # Format code with Prettier
```

### TypeScript Strict Mode

`tsconfig.json` uses strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Component Documentation

Add JSDoc comments to exported components and functions:

````typescript
/**
 * User card component for displaying user information
 *
 * @param props - Component props
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * <UserCard user={user} onEdit={handleEdit} />
 * ```
 */
export function UserCard({ user, onEdit }: UserCardProps) {
  // ...
}
````

## Testing (Future)

Recommended testing setup:

- **Unit tests**: Jest + React Testing Library
- **E2E tests**: Playwright or Cypress
- Test API services with mocked responses
- Test components with user interactions

## Performance

### Code Splitting

Next.js automatically code-splits pages. Use dynamic imports for heavy components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <LoadingSpinner />,
});
```

### Memoization

Use React.memo for expensive components:

```typescript
import { memo } from 'react';

export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  // Component logic
});
```

## Deployment

### Build for Production

```bash
yarn build         # Build optimized production bundle
yarn start         # Start production server
```

### Environment Variables

Set production environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
```

## Common Patterns

### Fetching Data in Server Components

```typescript
// app/users/page.tsx (Server Component)
import { usersService } from '@/lib/api';

export default async function UsersPage() {
  const response = await usersService.getAll(1, 10);

  if (response.status === 'error') {
    return <ErrorMessage message={response.message} />;
  }

  return <UsersList users={response.data} />;
}
```

### Client-Side Data Fetching

```typescript
// Client Component with 'use client'
'use client';

import { useEffect } from 'react';
import { useUsers } from '@/hooks';

export default function UsersPage() {
  const { users, fetchUsers } = useUsers();

  useEffect(() => {
    fetchUsers(1, 10);
  }, [fetchUsers]);

  return <UsersList users={users} />;
}
```

## Troubleshooting

### Common Issues

**1. Module not found errors:**

- Check `tsconfig.json` has correct path aliases
- Ensure imports use `@/` prefix for absolute imports

**2. Type errors:**

- Never use `any` - use proper types or `unknown`
- Use type guards for runtime type checking

**3. API errors:**

- Check `.env.local` has correct API URL
- Verify backend server is running
- Check network tab in browser DevTools

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [Tailwind CSS](https://tailwindcss.com/docs)
