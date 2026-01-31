/**
 * useAuth Hook
 * Provides convenient access to authentication context
 */

'use client';

import { useAuthContext } from '@/lib/providers/auth-provider';

/**
 * Hook to access authentication state and methods
 * Must be used within AuthProvider
 *
 * @returns Authentication context value
 *
 * @example
 * ```typescript
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <LoginForm onSubmit={(email, password) => login(email, password)} />;
 * }
 *
 * return <div>Welcome, {user.firstName}!</div>;
 * ```
 */
export function useAuth() {
  return useAuthContext();
}
