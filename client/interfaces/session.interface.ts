/**
 * Session interface for client-side
 * Represents a user's active session on a device
 */
export interface Session {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  ipAddress: string | null;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrent?: boolean;
}

/**
 * Session list response
 */
export interface SessionListResponse {
  sessions: Session[];
  total_sessions: number;
}

/**
 * Session revocation result
 */
export interface SessionRevocationResponse {
  revoked_count: number;
}
