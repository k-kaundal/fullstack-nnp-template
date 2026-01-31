/**
 * Auth Provider
 * Provides authentication context and state management across the application
 * with automatic token refresh, session validation, and secure storage
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthContextValue, RegisterData, User } from '@/interfaces';
import { StorageKey } from '@/enums';
import { getStorageItem, setStorageItem, removeStorageItem } from '@/lib/utils/storage';
import { isSuccessResponse } from '@/lib/utils/api-response';
import { toast } from '@/lib/utils';
import { authService } from '../api/auth.service';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Token refresh interval (13 minutes - tokens expire in 15 minutes)
const TOKEN_REFRESH_INTERVAL = 13 * 60 * 1000; // 13 minutes in milliseconds

// Session validation interval (check every 5 minutes)
const SESSION_VALIDATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Decode JWT token to get expiration time
 * @param token - JWT token
 * @returns Expiration timestamp or null
 */
function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch {
    return null;
  }
}

/**
 * Check if token is expired or will expire soon
 * @param token - JWT token
 * @param bufferMinutes - Buffer time before expiration (default 2 minutes)
 * @returns true if token is expired or expiring soon
 */
function isTokenExpiring(token: string, bufferMinutes: number = 2): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;

  const now = Date.now();
  const bufferMs = bufferMinutes * 60 * 1000;
  return now >= expiration - bufferMs;
}

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Wraps the application and provides authentication state
 * with automatic session management and token refresh
 *
 * @param props - Component props
 * @returns JSX Element
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_sessionId, setSessionId] = useState<string | null>(null);

  // Refs for intervals to prevent memory leaks
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear authentication state
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setSessionId(null);
    removeStorageItem(StorageKey.ACCESS_TOKEN);
    removeStorageItem(StorageKey.REFRESH_TOKEN);
    removeStorageItem(StorageKey.USER_DATA);
    removeStorageItem(StorageKey.SESSION_ID);

    // Clear intervals
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }
  }, []);

  /**
   * Store authentication data
   */
  const storeAuth = useCallback((
    userData: User,
    access: string,
    refresh: string,
    session?: string
  ) => {
    setUser(userData);
    setAccessToken(access);
    setRefreshToken(refresh);
    if (session) setSessionId(session);

    setStorageItem(StorageKey.USER_DATA, userData);
    setStorageItem(StorageKey.ACCESS_TOKEN, access);
    setStorageItem(StorageKey.REFRESH_TOKEN, refresh);
    if (session) setStorageItem(StorageKey.SESSION_ID, session);
  }, []);

  /**
   * Validate current session
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authService.getCurrentUser();
      if (isSuccessResponse<User>(response)) {
        setUser(response.data);
        setStorageItem(StorageKey.USER_DATA, response.data);
        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  /**
   * Refresh access token proactively
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = refreshToken || getStorageItem<string>(StorageKey.REFRESH_TOKEN);

    if (!currentRefreshToken) {
      clearAuth();
      return false;
    }

    try {
      const response = await authService.refreshToken(currentRefreshToken);

      if (isSuccessResponse(response)) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        setAccessToken(newAccessToken);
        setStorageItem(StorageKey.ACCESS_TOKEN, newAccessToken);

        if (newRefreshToken) {
          setRefreshToken(newRefreshToken);
          setStorageItem(StorageKey.REFRESH_TOKEN, newRefreshToken);
        }

        return true;
      } else {
        clearAuth();
        return false;
      }
    } catch {
      clearAuth();
      return false;
    }
  }, [refreshToken, clearAuth]);

  /**
   * Setup automatic token refresh
   */
  const setupTokenRefresh = useCallback(() => {
    // Clear existing interval
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    // Check token expiration and refresh if needed
    const checkAndRefresh = async () => {
      const currentAccessToken = accessToken || getStorageItem<string>(StorageKey.ACCESS_TOKEN);

      if (currentAccessToken && isTokenExpiring(currentAccessToken)) {
        await refreshAccessToken();
      }
    };

    // Run immediate check
    checkAndRefresh();

    // Setup interval for periodic refresh
    refreshIntervalRef.current = setInterval(checkAndRefresh, TOKEN_REFRESH_INTERVAL);
  }, [accessToken, refreshAccessToken]);

  /**
   * Setup session validation
   */
  const setupSessionValidation = useCallback(() => {
    // Clear existing interval
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
    }

    // Setup interval for periodic validation
    validationIntervalRef.current = setInterval(async () => {
      const isValid = await validateSession();
      if (!isValid && pathname && !pathname.startsWith('/auth')) {
        router.push('/auth/login');
      }
    }, SESSION_VALIDATION_INTERVAL);
  }, [validateSession, pathname, router]);

  // Initialize auth state from storage and validate session
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      const storedAccessToken = getStorageItem<string>(StorageKey.ACCESS_TOKEN);
      const storedRefreshToken = getStorageItem<string>(StorageKey.REFRESH_TOKEN);
      const storedUser = getStorageItem<User>(StorageKey.USER_DATA);
      const storedSessionId = getStorageItem<string>(StorageKey.SESSION_ID);

      if (storedAccessToken && storedRefreshToken && storedUser) {
        // First, restore refresh token state so it's available for refreshAccessToken
        setRefreshToken(storedRefreshToken);

        // Check if access token is expired or expiring soon
        if (isTokenExpiring(storedAccessToken)) {
          // Try to refresh token using the stored refresh token
          try {
            const response = await authService.refreshToken(storedRefreshToken);

            if (isSuccessResponse(response)) {
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

              // Update state with new tokens
              setAccessToken(newAccessToken);
              setStorageItem(StorageKey.ACCESS_TOKEN, newAccessToken);

              if (newRefreshToken) {
                setRefreshToken(newRefreshToken);
                setStorageItem(StorageKey.REFRESH_TOKEN, newRefreshToken);
              }

              // Restore user data
              setUser(storedUser);
              if (storedSessionId) setSessionId(storedSessionId);

              // Setup automatic refresh and validation
              setupTokenRefresh();
              setupSessionValidation();
            } else {
              // Refresh failed - clear auth
              clearAuth();
            }
          } catch {
            // Refresh failed - clear auth
            clearAuth();
          }
        } else {
          // Token still valid, restore auth state
          setAccessToken(storedAccessToken);
          setUser(storedUser);
          if (storedSessionId) setSessionId(storedSessionId);

          // Setup automatic refresh and validation
          setupTokenRefresh();
          setupSessionValidation();
        }
      }

      setIsLoading(false);
    };

    initAuth();

    // Listen for auth logout event (from API client)
    const handleLogoutEvent = () => {
      clearAuth();
      router.push('/auth/login');
    };

    window.addEventListener('auth:logout', handleLogoutEvent);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent);
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  /**
   * Login user
   */
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.login({ email, password });

      if (isSuccessResponse(response)) {
        const { user: userData, accessToken: access, refreshToken: refresh, sessionId: session } = response.data;
        storeAuth(userData, access, refresh, session);

        // Setup automatic token refresh and session validation
        setupTokenRefresh();
        setupSessionValidation();

        toast.success('Login successful!');

        // Redirect to intended page or dashboard
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/admin';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);

        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      // Always clear auth state
      clearAuth();
      toast.success('Logged out successfully');
      router.push('/auth/login');
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.register(data);

      if (isSuccessResponse(response)) {
        const { user: userData, accessToken: access, refreshToken: refresh, sessionId: session } = response.data;
        storeAuth(userData, access, refresh, session);

        // Setup automatic token refresh and session validation
        setupTokenRefresh();
        setupSessionValidation();

        toast.success('Registration successful! Please check your email to verify your account.');
        router.push('/admin');

        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Verify email with token
   */
  const verifyEmail = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.verifyEmail(token);

      if (isSuccessResponse(response)) {
        toast.success('Email verified successfully!');

        // Refresh user data
        await validateSession();

        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Resend verification email
   */
  const resendVerification = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.resendVerification();

      if (isSuccessResponse(response)) {
        toast.success('Verification email sent! Please check your inbox.');
        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Request password reset
   */
  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.forgotPassword(email);

      if (isSuccessResponse(response)) {
        toast.success('Password reset email sent! Please check your inbox.');
        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send password reset email';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (token: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authService.resetPassword(token, password);

      if (isSuccessResponse(response)) {
        toast.success('Password reset successfully! You can now login with your new password.');
        router.push('/auth/login');
        return { success: true };
      } else {
        toast.error(response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value: AuthContextValue = {
    user,
    accessToken,
    refreshToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    logout,
    register,
    refreshAccessToken,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 * Must be used within AuthProvider
 *
 * @returns Auth context value
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```typescript
 * const { user, login, logout } = useAuth();
 * ```
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
