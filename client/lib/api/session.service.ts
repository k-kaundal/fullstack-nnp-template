import { apiClient } from './client';
import { Session, SessionRevocationResponse } from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

/**
 * Session management service
 * Handles multi-device login tracking and session control
 */
export class SessionService {
  /**
   * Get all active sessions for current user
   */
  async getSessions(): Promise<ApiSuccessResponse<Session[]> | ApiErrorResponse> {
    return apiClient.get<Session[]>('/auth/sessions');
  }

  /**
   * Revoke a specific session
   *
   * @param sessionId - Session ID to revoke
   */
  async revokeSession(sessionId: string): Promise<ApiSuccessResponse<void> | ApiErrorResponse> {
    return apiClient.delete('/auth/sessions/revoke', { sessionId });
  }

  /**
   * Revoke all other sessions except current one
   *
   * @param currentSessionId - Optional current session ID
   */
  async revokeOtherSessions(
    currentSessionId?: string
  ): Promise<ApiSuccessResponse<SessionRevocationResponse> | ApiErrorResponse> {
    return apiClient.delete<SessionRevocationResponse>('/auth/sessions/revoke-others', {
      currentSessionId,
    });
  }

  /**
   * Force logout from all devices
   */
  async logoutAllDevices(): Promise<
    ApiSuccessResponse<SessionRevocationResponse> | ApiErrorResponse
  > {
    return apiClient.delete<SessionRevocationResponse>('/auth/sessions/logout-all', {});
  }
}

export const sessionService = new SessionService();
