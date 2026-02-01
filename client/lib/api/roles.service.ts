import { apiClient } from './client';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';
import { CreateRoleDto, UpdateRoleDto, Role } from '@/interfaces';

/**
 * Service for role management operations
 * Admin-controlled role creation and management
 */
export class RolesService {
  private readonly basePath = '/roles';

  /**
   * Get all roles with pagination
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns Promise<ApiSuccessResponse<Role[]> | ApiErrorResponse>
   */
  async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiSuccessResponse<Role[]> | ApiErrorResponse> {
    return apiClient.get<Role[]>(this.basePath, { page, limit });
  }

  /**
   * Get single role by ID
   *
   * @param id - Role UUID
   * @returns Promise<ApiSuccessResponse<Role> | ApiErrorResponse>
   */
  async getById(id: string): Promise<ApiSuccessResponse<Role> | ApiErrorResponse> {
    return apiClient.get<Role>(`${this.basePath}/${id}`);
  }

  /**
   * Create new custom role (Admin only)
   *
   * @param data - Role creation data with permission IDs
   * @returns Promise<ApiSuccessResponse<Role> | ApiErrorResponse>
   *
   * @example
   * ```typescript
   * const response = await rolesService.create({
   *   name: 'Content Manager',
   *   description: 'Manages all content',
   *   permissionIds: ['perm-uuid-1', 'perm-uuid-2'],
   *   isSystemRole: false
   * });
   * ```
   */
  async create(data: CreateRoleDto): Promise<ApiSuccessResponse<Role> | ApiErrorResponse> {
    return apiClient.post<Role>(this.basePath, data as CreateRoleDto);
  }

  /**
   * Update existing role (Admin only)
   *
   * @param id - Role UUID
   * @param data - Role update data
   * @returns Promise<ApiSuccessResponse<Role> | ApiErrorResponse>
   *
   * @example
   * ```typescript
   * const response = await rolesService.update('role-uuid', {
   *   name: 'Senior Content Manager',
   *   permissionIds: ['perm-1', 'perm-2', 'perm-3']
   * });
   * ```
   */
  async update(
    id: string,
    data: UpdateRoleDto
  ): Promise<ApiSuccessResponse<Role> | ApiErrorResponse> {
    return apiClient.put<Role>(`${this.basePath}/${id}`, data as UpdateRoleDto);
  }

  /**
   * Delete custom role (Admin only)
   * Cannot delete system roles or roles with active users
   *
   * @param id - Role UUID
   * @returns Promise<ApiSuccessResponse<void> | ApiErrorResponse>
   */
  async delete(id: string): Promise<ApiSuccessResponse<void> | ApiErrorResponse> {
    return apiClient.delete<void>(`${this.basePath}/${id}`);
  }

  /**
   * Get role statistics for sidebar
   *
   * @returns Promise with role statistics
   */
  async getStatistics(): Promise<
    | ApiSuccessResponse<{
        total: number;
        system: number;
        custom: number;
      }>
    | ApiErrorResponse
  > {
    return apiClient.get(`${this.basePath}/statistics`);
  }
}

export const rolesService = new RolesService();
