'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/utils';
import { isSuccessResponse } from '@/lib/utils';
import { Permission, CreateRoleDto } from '@/interfaces';
import { LoadingSpinner } from '@/components/ui';
import { permissionsService } from '@/lib/api/permissions.service';
import { rolesService } from '@/lib/api/roles.service';

/**
 * Admin page for creating custom roles
 * Allows admins to create roles with specific permissions
 */
export default function CreateRolePage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateRoleDto>({
    name: '',
    description: '',
    permissionIds: [],
    isSystemRole: false,
  });

  useEffect(() => {
    const loadPermissions = async () => {
      setIsLoading(true);
      const response = await permissionsService.getAll();
      if (isSuccessResponse(response)) {
        // Response data contains { permissions, grouped }
        const data = response.data?.permissions || [];
        setPermissions(data);
      } else {
        toast.error('Failed to load permissions');
        setPermissions([]);
      }
      setIsLoading(false);
    };

    void loadPermissions();
  }, []);

  const togglePermission = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permId)
        ? prev.permissionIds.filter((id) => id !== permId)
        : [...prev.permissionIds, permId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (formData.permissionIds.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    setIsSubmitting(true);

    const response = await rolesService.create(formData);

    if (isSuccessResponse(response)) {
      toast.success('Role created successfully!');
      router.push('/admin/roles');
    } else {
      toast.error(response.message || 'Failed to create role');
    }

    setIsSubmitting(false);
  };

  // Group permissions by resource - only if permissions is an array
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create Custom Role</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Define a new role with specific permissions
        </p>
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

        {/* Permissions Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Permissions *
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formData.permissionIds.length} permission(s) selected
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
                        checked={formData.permissionIds.includes(perm.id)}
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
            disabled={isSubmitting || formData.permissionIds.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            <span>{isSubmitting ? 'Creating...' : 'Create Role'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
