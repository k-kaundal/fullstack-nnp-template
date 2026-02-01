import { apiClient } from './client';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { CreatePermissionDto, Permission } from '@/interfaces';

/**
 * Service for permission management operations
 * Admin-controlled permission creation
 */
export class PermissionsService {
  private readonly basePath = '/permissions';

  /**
   * Get all permissions
   * No pagination - typically small dataset
   *
   * @returns Promise with permissions array and grouped object
   */
  async getAll(): Promise<
    | ApiSuccessResponse<{
        permissions: Permission[];
        grouped: Record<string, Permission[]>;
      }>
    | ApiErrorResponse
  > {
    return apiClient.get(this.basePath);
  }

  /**
   * Create new permission (Admin only)
   *
   * @param data - Permission creation data
   * @returns Promise<ApiSuccessResponse<Permission> | ApiErrorResponse>
   *
   * @example
   * ```typescript
   * const response = await permissionsService.create({
   *   name: 'products:manage',
   *   description: 'Full access to product management',
   *   resource: 'products',
   *   action: 'manage'
   * });
   * ```
   */
  async create(
    data: CreatePermissionDto
  ): Promise<ApiSuccessResponse<Permission> | ApiErrorResponse> {
    return apiClient.post<Permission>(this.basePath, data);
  }

  /**
   * Get permissions grouped by resource
   * Helper method for UI organization
   *
   * @returns Permissions grouped by resource
   */
  async getGroupedByResource(): Promise<
    ApiSuccessResponse<Record<string, Permission[]>> | ApiErrorResponse
  > {
    const response = await this.getAll();
    if ('status' in response && response.status === 'error') {
      return response;
    }

    const grouped = (response as unknown as ApiSuccessResponse<Permission[]>).data.reduce(
      (acc, perm) => {
        const resource = perm.resource || 'other';
        if (!acc[resource]) {
          acc[resource] = [];
        }
        acc[resource].push(perm);
        return acc;
      },
      {} as Record<string, Permission[]>
    );

    return {
      status: 'success',
      statusCode: 200,
      message: 'Permissions grouped successfully',
      data: grouped,
      timestamp: new Date().toISOString(),
      path: this.basePath,
    };
  }

  /**
   * Get permission statistics for sidebar
   */
  async getStatistics(): Promise<
    | ApiSuccessResponse<{
        total: number;
        resources: number;
      }>
    | ApiErrorResponse
  > {
    return apiClient.get(`${this.basePath}/statistics`);
  }
}

export const permissionsService = new PermissionsService();
