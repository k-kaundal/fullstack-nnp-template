/**
 * Request Log Interface
 * Represents a single HTTP request log entry
 */
export interface RequestLog {
  id: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestBody: string | null;
  queryParams: string | null;
  errorMessage: string | null;
  createdAt: string;
}

/**
 * Request Log Statistics
 */
export interface RequestLogStatistics {
  total: number;
  today: number;
  errors: number;
  averageResponseTime: number;
}

/**
 * Cleanup Statistics
 */
export interface CleanupStatistics {
  totalLogs: number;
  todayLogs: number;
  retentionHours: number;
  nextCleanup: string;
}
