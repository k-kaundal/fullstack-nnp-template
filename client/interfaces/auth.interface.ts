/**
 * Authentication related interfaces
 */

import { User } from './user.interface';

/**
 * Authentication context value
 * Used for managing auth state across the application
 */
export interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  refreshAccessToken: () => Promise<boolean>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Login credentials
 */
export interface LoginCredentials extends Record<string, string> {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData extends Record<string, string> {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId?: string;
}

/**
 * Token refresh request
 */
export interface RefreshTokenRequest extends Record<string, string> {
  refreshToken: string;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest extends Record<string, string> {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest extends Record<string, string> {
  token: string;
  password: string;
}

/**
 * Verify email request
 */
export interface VerifyEmailRequest extends Record<string, string> {
  token: string;
}
