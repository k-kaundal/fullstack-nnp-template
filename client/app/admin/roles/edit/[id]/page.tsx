'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/lib/utils';
import { isSuccessResponse } from '@/lib/utils';
import { Permission, Role, UpdateRoleDto } from '@/interfaces';
import { LoadingSpinner } from '@/components/ui';
import { permissionsService } from '@/lib/api/permissions.service';
import { rolesService } from '@/lib/api/roles.service';

/**
 * Admin page for editing roles
 * Allows admins to update role details and permissions
 */
export default function EditRolePage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.id as string;

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<UpdateRoleDto>({
    name: '',
    description: '',
    permissionIds: [],
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      const [roleRes, permsRes] = await Promise.all([
        rolesService.getById(roleId),
        permissionsService.getAll(),
      ]);

      if (isSuccessResponse<Role>(roleRes)) {
        const roleData = roleRes.data;
        setRole(roleData);
        setFormData({
          name: roleData.name,
          description: roleData.description || '',
          permissionIds: roleData.permissions?.map((p) => p.id) || [],
        });
      } else {
        toast.error('Failed to load role');
        router.push('/admin/roles');
      }

      if (isSuccessResponse(permsRes)) {
        const data = permsRes.data?.permissions || [];
        setPermissions(data);
      } else {
        toast.error('Failed to load permissions');
        setPermissions([]);
      }

      setIsLoading(false);
    };

    if (roleId) {
      void loadData();
    }
  }, [roleId, router]);

  const togglePermission = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: (prev.permissionIds || []).includes(permId)
        ? (prev.permissionIds || []).filter((id) => id !== permId)
        : [...(prev.permissionIds || []), permId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (!formData.permissionIds || formData.permissionIds.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    setIsSubmitting(true);

    const response = await rolesService.update(roleId, formData);

    if (isSuccessResponse(response)) {
      toast.success('Role updated successfully!');
      router.push('/admin/roles');
    } else {
      toast.error(response.message || 'Failed to update role');
    }

    setIsSubmitting(false);
  };

  // Group permissions by resource
  const groupedPermissions = Array.isArray(permissions)
    ? permissions.reduce(
        (acc, perm) => {
          const resource = perm.resource || 'other';
          if (!acc[resource]) {
            acc[resource] = [];
          }
          acc[resource].push(perm);
          return acc;
        },
        {} as Record<string, Permission[]>
      )
    : {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!role) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Role Not Found
          </h2>
          <p className="text-red-700 dark:text-red-300 mb-4">
            The requested role could not be found.
          </p>
          <button
            onClick={() => router.push('/admin/roles')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Roles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit Role</h1>
        <p className="text-gray-600 dark:text-gray-400">Update role details and permissions</p>
        {role.isSystemRole && (
          <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                System Role: Editing system roles may affect application functionality
              </span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Name */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Role Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Content Manager, Product Manager"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            required
          />
          {role.isSystemRole && (
            <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
              Changing system role names may break role-based logic in the application
            </p>
          )}
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What does this role do? Who should have it?"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Current Permissions Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Currently {formData.permissionIds?.length || 0} permission(s) selected
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Original: {role.permissions?.length || 0} permission(s)
              </p>
            </div>
          </div>
        </div>

        {/* Permissions Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Permissions *
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose which actions this role can perform
            </p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource} className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold text-lg capitalize mb-2 text-gray-800 dark:text-gray-200">
                  {resource}
                </h3>
                <div className="space-y-2">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.permissionIds || []).includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {perm.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {perm.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin/roles')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting || !formData.permissionIds || formData.permissionIds.length === 0
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            <span>{isSubmitting ? 'Updating...' : 'Update Role'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
