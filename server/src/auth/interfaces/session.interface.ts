/**
 * Session response interface
 * Structure returned for session data
 */
export interface SessionResponse {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  ipAddress: string | null;
  lastActivityAt: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent?: boolean;
}

/**
 * Device information extracted from User-Agent
 */
export interface DeviceInfo {
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser?: string;
  os?: string;
}
