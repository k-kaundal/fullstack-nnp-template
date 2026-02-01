'use client';

import { useState } from 'react';
import { toast, isSuccessResponse } from '@/lib/utils';
import { Role } from '@/interfaces';
import { Modal, LoadingSpinner } from '@/components/ui';
import { rolesService } from '@/lib/api/roles.service';
import { usersService } from '@/lib/api/users.service';

/**
 * Props for AssignRolesDialog component
 */
interface AssignRolesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  currentRoles: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

/**
 * Dialog for assigning/removing roles to/from a user
 * Allows admins to manage user roles
 */
export function AssignRolesDialog({
  isOpen,
  onClose,
  userId,
  userEmail,
  currentRoles,
  onSuccess,
}: AssignRolesDialogProps) {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(currentRoles.map((r) => r.id));
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const fetchRoles = async () => {
    setIsFetching(true);
    const response = await rolesService.getAll(1, 100);
    if (isSuccessResponse(response)) {
      setAvailableRoles(response.data);
    } else {
      toast.error('Failed to load roles');
    }
    setIsFetching(false);
  };

  // Fetch available roles when dialog opens
  useState(() => {
    if (isOpen && availableRoles.length === 0) {
      fetchRoles();
    }
  });

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const response = await usersService.assignRoles(userId, selectedRoleIds);

    if (isSuccessResponse(response)) {
      toast.success('Roles updated successfully!');
      onSuccess?.();
      onClose();
    } else {
      toast.error(response.message || 'Failed to update roles');
    }

    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Roles"
      size="md"
      footer={
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || isFetching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Managing roles for: <strong>{userEmail}</strong>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {selectedRoleIds.length} role(s) selected
          </p>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableRoles.map((role) => {
              const isSelected = selectedRoleIds.includes(role.id);
              const isSystemRole = role.isSystemRole;

              return (
                <label
                  key={role.id}
                  className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleRole(role.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {role.name}
                      </span>
                      {isSystemRole && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                          System
                        </span>
                      )}
                    </div>
                    {role.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {role.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {role.permissions.length} permission(s)
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {availableRoles.length === 0 && !isFetching && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No roles available
          </div>
        )}
      </div>
    </Modal>
  );
}
