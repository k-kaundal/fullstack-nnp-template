/**
 * Custom React hook for users API operations
 * Provides state management and CRUD operations for users
 */

'use client';

import { useState, useCallback } from 'react';
import { User, CreateUserDto, UpdateUserDto } from '@/interfaces';
import { ApiErrorResponse, PaginationMeta } from '@/types';
import { isSuccessResponse } from '@/lib/utils';
import { usersService } from '@/lib/api/users.service';

interface UseUsersState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationMeta | null;
}

interface UseUsersReturn extends UseUsersState {
  fetchUsers: (page?: number, limit?: number) => Promise<void>;
  fetchUserById: (id: string) => Promise<void>;
  createUser: (data: CreateUserDto) => Promise<User | null>;
  updateUser: (id: string, data: UpdateUserDto) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Custom hook for managing users
 *
 * @returns Users state and CRUD operations
 *
 * @example
 * ```typescript
 * function UsersPage() {
 *   const { users, isLoading, error, fetchUsers, createUser } = useUsers();
 *
 *   useEffect(() => {
 *     fetchUsers(1, 10);
 *   }, [fetchUsers]);
 *
 *   return (
 *     <div>
 *       {isLoading && <p>Loading...</p>}
 *       {error && <p>Error: {error}</p>}
 *       {users.map(user => <UserCard key={user.id} user={user} />)}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUsers(): UseUsersReturn {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
    pagination: null,
  });

  /**
   * Fetches all users with pagination
   */
  const fetchUsers = useCallback(async (page: number = 1, limit: number = 10) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await usersService.getAll(page, limit);

      if (isSuccessResponse<User[]>(response)) {
        setState((prev) => ({
          ...prev,
          users: response.data,
          pagination: response.meta as PaginationMeta,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: (response as ApiErrorResponse).message,
          isLoading: false,
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch users',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Fetches a single user by ID
   */
  const fetchUserById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await usersService.getById(id);

      if (isSuccessResponse<User>(response)) {
        setState((prev) => ({
          ...prev,
          currentUser: response.data,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: (response as ApiErrorResponse).message,
          isLoading: false,
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch user',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Creates a new user
   *
   * @returns Created user or null if failed
   */
  const createUser = useCallback(async (data: CreateUserDto): Promise<User | null> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await usersService.create(data);

      if (isSuccessResponse<User>(response)) {
        setState((prev) => ({
          ...prev,
          users: [...prev.users, response.data],
          isLoading: false,
        }));
        return response.data;
      } else {
        setState((prev) => ({
          ...prev,
          error: (response as ApiErrorResponse).message,
          isLoading: false,
        }));
        return null;
      }
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'Failed to create user',
        isLoading: false,
      }));
      return null;
    }
  }, []);

  /**
   * Updates an existing user
   *
   * @returns Updated user or null if failed
   */
  const updateUser = useCallback(
    async (id: string, data: UpdateUserDto): Promise<User | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await usersService.update(id, data);

        if (isSuccessResponse<User>(response)) {
          setState((prev) => ({
            ...prev,
            users: prev.users.map((user) =>
              user.id === id ? response.data : user
            ),
            currentUser:
              prev.currentUser?.id === id ? response.data : prev.currentUser,
            isLoading: false,
          }));
          return response.data;
        } else {
          setState((prev) => ({
            ...prev,
            error: (response as ApiErrorResponse).message,
            isLoading: false,
          }));
          return null;
        }
      } catch {
        setState((prev) => ({
          ...prev,
          error: 'Failed to update user',
          isLoading: false,
        }));
        return null;
      }
    },
    []
  );

  /**
   * Deletes a user
   *
   * @returns True if successful, false otherwise
   */
  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await usersService.delete(id);

      if (isSuccessResponse<void>(response)) {
        setState((prev) => ({
          ...prev,
          users: prev.users.filter((user) => user.id !== id),
          currentUser: prev.currentUser?.id === id ? null : prev.currentUser,
          isLoading: false,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: (response as ApiErrorResponse).message,
          isLoading: false,
        }));
        return false;
      }
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'Failed to delete user',
        isLoading: false,
      }));
      return false;
    }
  }, []);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  };
}
