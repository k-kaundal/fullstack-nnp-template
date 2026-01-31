/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './client';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/interfaces';
import { User } from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

/**
 * Authentication Service class
 * Provides methods for all auth operations
 */
export class AuthService {
  private readonly basePath = '/auth';

  /**
   * Register a new user
   *
   * @param data - Registration data
   * @returns API response with user and tokens
   *
   * @example
   * ```typescript
   * const response = await authService.register({
   *   email: 'user@example.com',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   password: 'SecurePass123!'
   * });
   * ```
   */
  async register(data: RegisterData): Promise<ApiSuccessResponse<AuthResponse> | ApiErrorResponse> {
    return apiClient.post<AuthResponse>(`${this.basePath}/register`, data);
  }

  /**
   * Login user
   *
   * @param credentials - Login credentials
   * @returns API response with user and tokens
   *
   * @example
   * ```typescript
   * const response = await authService.login({
   *   email: 'user@example.com',
   *   password: 'SecurePass123!'
   * });
   * ```
   */
  async login(
    credentials: LoginCredentials
  ): Promise<ApiSuccessResponse<AuthResponse> | ApiErrorResponse> {
    return apiClient.post<AuthResponse>(`${this.basePath}/login`, credentials);
  }

  /**
   * Logout user
   *
   * @returns API response
   *
   * @example
   * ```typescript
   * await authService.logout();
   * ```
   */
  async logout(): Promise<ApiSuccessResponse<null> | ApiErrorResponse> {
    return apiClient.post<null>(`${this.basePath}/logout`, {});
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshToken - Refresh token
   * @returns API response with new access token
   *
   * @example
   * ```typescript
   * const response = await authService.refreshToken('refresh_token_here');
   * ```
   */
  async refreshToken(
    refreshToken: string
  ): Promise<ApiSuccessResponse<RefreshTokenResponse> | ApiErrorResponse> {
    return apiClient.post<RefreshTokenResponse>(`${this.basePath}/refresh`, {
      refreshToken,
    } as RefreshTokenRequest);
  }

  /**
   * Request password reset email
   *
   * @param email - User email
   * @returns API response
   *
   * @example
   * ```typescript
   * await authService.forgotPassword('user@example.com');
   * ```
   */
  async forgotPassword(email: string): Promise<ApiSuccessResponse<null> | ApiErrorResponse> {
    return apiClient.post<null>(`${this.basePath}/forgot-password`, {
      email,
    } as ForgotPasswordRequest);
  }

  /**
   * Reset password with token
   *
   * @param token - Reset token from email
   * @param password - New password
   * @returns API response
   *
   * @example
   * ```typescript
   * await authService.resetPassword('reset_token', 'NewPass123!');
   * ```
   */
  async resetPassword(
    token: string,
    password: string
  ): Promise<ApiSuccessResponse<null> | ApiErrorResponse> {
    return apiClient.post<null>(`${this.basePath}/reset-password`, {
      token,
      password,
    } as ResetPasswordRequest);
  }

  /**
   * Verify email with token
   *
   * @param token - Verification token from email
   * @returns API response
   *
   * @example
   * ```typescript
   * await authService.verifyEmail('verification_token');
   * ```
   */
  async verifyEmail(token: string): Promise<ApiSuccessResponse<null> | ApiErrorResponse> {
    return apiClient.post<null>(`${this.basePath}/verify-email`, {
      token,
    } as VerifyEmailRequest);
  }

  /**
   * Resend verification email
   *
   * @returns API response
   *
   * @example
   * ```typescript
   * await authService.resendVerification();
   * ```
   */
  async resendVerification(): Promise<ApiSuccessResponse<null> | ApiErrorResponse> {
    return apiClient.post<null>(`${this.basePath}/resend-verification`, {});
  }

  /**
   * Get current authenticated user
   *
   * @returns API response with user data
   *
   * @example
   * ```typescript
   * const response = await authService.getCurrentUser();
   * ```
   */
  async getCurrentUser(): Promise<ApiSuccessResponse<User> | ApiErrorResponse> {
    return apiClient.get<User>(`${this.basePath}/me`);
  }
}

// Export singleton instance
export const authService = new AuthService();
