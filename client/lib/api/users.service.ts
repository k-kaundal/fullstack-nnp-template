/**
 * Users API service
 * Provides type-safe methods for user-related API calls
 */

import { apiClient } from './client';
import { User, CreateUserDto, UpdateUserDto } from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

/**
 * Search users parameters
 */
export interface SearchUsersParams {
  search?: string;
  isActive?: boolean;
  sortBy?: 'email' | 'firstName' | 'lastName' | 'createdAt' | 'isActive';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  [key: string]: string | number | boolean | undefined; // Index signature for QueryParams compatibility
}

/**
 * Users service class
 * Handles all user-related API operations
 */
export class UsersService {
  /**
   * Fetches all users with pagination
   *
   * @param page - Page number (defaults to 1)
   * @param limit - Items per page (defaults to 10)
   * @returns Promise with user list or error
   *
   * @example
   * ```typescript
   * const response = await usersService.getAll(1, 10);
   * if (response.status === 'success') {
   *   console.log(response.data); // User[]
   *   console.log(response.meta?.total_pages);
   * }
   * ```
   */
  async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<ApiSuccessResponse<User[]> | ApiErrorResponse> {
    return apiClient.get<User[]>('/users', { page, limit });
  }

  /**
   * Fetches a single user by ID
   *
   * @param id - User UUID
   * @returns Promise with user data or error
   *
   * @example
   * ```typescript
   * const response = await usersService.getById('user-uuid');
   * if (response.status === 'success') {
   *   console.log(response.data); // User
   * }
   * ```
   */
  async getById(id: string): Promise<ApiSuccessResponse<User> | ApiErrorResponse> {
    return apiClient.get<User>(`/users/${id}`);
  }

  /**
   * Creates a new user
   *
   * @param data - User creation data
   * @returns Promise with created user or error
   *
   * @example
   * ```typescript
   * const response = await usersService.create({
   *   email: 'john@example.com',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   password: 'SecurePass123!'
   * });
   * ```
   */
  async create(data: CreateUserDto): Promise<ApiSuccessResponse<User> | ApiErrorResponse> {
    return apiClient.post<User>('/users', data);
  }

  /**
   * Updates an existing user
   *
   * @param id - User UUID
   * @param data - User update data (partial)
   * @returns Promise with updated user or error
   *
   * @example
   * ```typescript
   * const response = await usersService.update('user-uuid', {
   *   firstName: 'Jane'
   * });
   * ```
   */
  async update(
    id: string,
    data: UpdateUserDto
  ): Promise<ApiSuccessResponse<User> | ApiErrorResponse> {
    return apiClient.patch<User>(`/users/${id}`, data);
  }

  /**
   * Deletes a user
   *
   * @param id - User UUID
   * @returns Promise with success message or error
   *
   * @example
   * ```typescript
   * const response = await usersService.delete('user-uuid');
   * if (response.status === 'success') {
   *   console.log('User deleted');
   * }
   * ```
   */
  async delete(id: string): Promise<ApiSuccessResponse<void> | ApiErrorResponse> {
    return apiClient.delete<void>(`/users/${id}`);
  }

  /**
   * Advanced search for users with filters
   *
   * @param params - Search parameters (search query, filters, sorting, pagination)
   * @returns Promise with search results or error
   *
   * @example
   * ```typescript
   * const response = await usersService.search({
   *   search: 'john',
   *   isActive: 'true',
   *   sortBy: 'email',
   *   sortOrder: 'asc',
   *   page: 1,
   *   limit: 10
   * });
   * ```
   */
  async search(params: SearchUsersParams): Promise<ApiSuccessResponse<User[]> | ApiErrorResponse> {
    return apiClient.get<User[]>('/users/search/advanced', params);
  }

  /**
   * Bulk activate users
   *
   * @param ids - Array of user IDs
   * @returns Promise with operation result or error
   *
   * @example
   * ```typescript
   * const response = await usersService.bulkActivate(['id1', 'id2']);
   * if (response.status === 'success') {
   *   console.log(`Activated ${response.data.affected} users`);
   * }
   * ```
   */
  async bulkActivate(
    ids: string[]
  ): Promise<ApiSuccessResponse<{ affected: number }> | ApiErrorResponse> {
    return apiClient.post<{ affected: number }>('/users/bulk/activate', { ids });
  }

  /**
   * Bulk deactivate users
   *
   * @param ids - Array of user IDs
   * @returns Promise with operation result or error
   *
   * @example
   * ```typescript
   * const response = await usersService.bulkDeactivate(['id1', 'id2']);
   * ```
   */
  async bulkDeactivate(
    ids: string[]
  ): Promise<ApiSuccessResponse<{ affected: number }> | ApiErrorResponse> {
    return apiClient.post<{ affected: number }>('/users/bulk/deactivate', {
      ids,
    });
  }

  /**
   * Bulk delete users
   *
   * @param ids - Array of user IDs
   * @returns Promise with operation result or error
   *
   * @example
   * ```typescript
   * const response = await usersService.bulkDelete(['id1', 'id2']);
   * ```
   */
  async bulkDelete(
    ids: string[]
  ): Promise<ApiSuccessResponse<{ affected: number }> | ApiErrorResponse> {
    return apiClient.delete<{ affected: number }>('/users/bulk', { ids });
  }

  /**
   * Assign roles to user (Admin only)
   *
   * @param userId - User UUID
   * @param roleIds - Array of role UUIDs to assign
   * @returns Promise with updated user including roles
   *
   * @example
   * ```typescript
   * const response = await usersService.assignRoles('user-uuid', [
   *   'admin-role-uuid',
   *   'editor-role-uuid'
   * ]);
   * if (response.status === 'success') {
   *   console.log('Roles assigned:', response.data.roles);
   * }
   * ```
   */
  async assignRoles(
    userId: string,
    roleIds: string[]
  ): Promise<ApiSuccessResponse<User> | ApiErrorResponse> {
    return apiClient.post<User>(`/users/${userId}/roles`, { roleIds });
  }

  /**
   * Get user's assigned roles
   *
   * @param userId - User UUID
   * @returns Promise with user's roles
   *
   * @example
   * ```typescript
   * const response = await usersService.getUserRoles('user-uuid');
   * if (response.status === 'success') {
   *   console.log('User roles:', response.data);
   * }
   * ```
   */
  async getUserRoles(
    userId: string
  ): Promise<
    ApiSuccessResponse<Array<{ id: string; name: string; description: string }>> | ApiErrorResponse
  > {
    return apiClient.get(`/users/${userId}/roles`);
  }

  /**
   * Remove specific role from user (Admin only)
   *
   * @param userId - User UUID
   * @param roleId - Role UUID to remove
   * @returns Promise with success message
   *
   * @example
   * ```typescript
   * const response = await usersService.removeRole('user-uuid', 'role-uuid');
   * if (response.status === 'success') {
   *   console.log('Role removed');
   * }
   * ```
   */
  async removeRole(
    userId: string,
    roleId: string
  ): Promise<ApiSuccessResponse<void> | ApiErrorResponse> {
    return apiClient.delete<void>(`/users/${userId}/roles/${roleId}`);
  }

  /**
   * Get user statistics for dashboard
   *
   * @returns Promise with user statistics or error
   *
   * @example
   * ```typescript
   * const response = await usersService.getStatistics();
   * if (response.status === 'success') {
   *   console.log('Total users:', response.data.total);
   *   console.log('Active users:', response.data.active);
   *   console.log('Inactive users:', response.data.inactive);
   * }
   * ```
   */
  async getStatistics(): Promise<
    | ApiSuccessResponse<{
        total: number;
        active: number;
        inactive: number;
        pending: number;
        todayRegistered: number;
      }>
    | ApiErrorResponse
  > {
    return apiClient.get('/users/statistics');
  }
}

// Export singleton instance
export const usersService = new UsersService();
