import { apiClient } from './client';
import {
  RequestLog,
  RequestLogStatistics,
  CleanupStatistics,
} from '@/interfaces/request-log.interface';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

/**
 * Request Logs Service
 * Handles API calls for viewing and managing request logs
 */
export class RequestLogsService {
  private readonly baseUrl = '/admin/request-logs';

  /**
   * Get all request logs with pagination
   *
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated request logs
   */
  async getRequestLogs(
    page: number = 1,
    limit: number = 50
  ): Promise<ApiSuccessResponse<RequestLog[]> | ApiErrorResponse> {
    return apiClient.get<RequestLog[]>(this.baseUrl, { page, limit });
  }

  /**
   * Get request logs for specific user
   *
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns User's request logs
   */
  async getUserRequestLogs(
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<ApiSuccessResponse<RequestLog[]> | ApiErrorResponse> {
    return apiClient.get<RequestLog[]>(`${this.baseUrl}/user`, {
      userId,
      page,
      limit,
    });
  }

  /**
   * Get request log statistics
   *
   * @returns Request statistics
   */
  async getStatistics(): Promise<ApiSuccessResponse<RequestLogStatistics> | ApiErrorResponse> {
    return apiClient.get<RequestLogStatistics>(`${this.baseUrl}/statistics`);
  }

  /**
   * Get cleanup statistics
   *
   * @returns Cleanup statistics
   */
  async getCleanupStats(): Promise<ApiSuccessResponse<CleanupStatistics> | ApiErrorResponse> {
    return apiClient.get<CleanupStatistics>(`${this.baseUrl}/cleanup/stats`);
  }

  /**
   * Trigger manual cleanup of old logs
   *
   * @param hours - Hours threshold (optional)
   * @returns Cleanup result
   */
  async triggerCleanup(
    hours: number = 24
  ): Promise<ApiSuccessResponse<{ deleted_count: number }> | ApiErrorResponse> {
    return apiClient.post<{ deleted_count: number }>(`${this.baseUrl}/cleanup/trigger`, { hours });
  }
}

export const requestLogsService = new RequestLogsService();
