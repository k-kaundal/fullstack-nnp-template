'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/lib/utils';
import { isSuccessResponse } from '@/lib/utils';
import { Role, Permission } from '@/interfaces';
import { LoadingSpinner, Confirm } from '@/components/ui';
import { permissionsService } from '@/lib/api/permissions.service';
import { rolesService } from '@/lib/api/roles.service';

/**
 * Admin page for managing roles
 * List, create, edit, delete custom roles
 */
export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        rolesService.getAll(1, 100),
        permissionsService.getAll(),
      ]);

      if (isSuccessResponse(rolesRes)) {
        setRoles(rolesRes.data);
      }
      if (isSuccessResponse(permsRes)) {
        setPermissions(Array.isArray(permsRes.data) ? permsRes.data : []);
      }
      setIsLoading(false);
    };

    void loadData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [rolesRes, permsRes] = await Promise.all([
      rolesService.getAll(1, 100),
      permissionsService.getAll(),
    ]);

    if (isSuccessResponse(rolesRes)) {
      setRoles(rolesRes.data);
    }
    if (isSuccessResponse(permsRes)) {
      setPermissions(Array.isArray(permsRes.data) ? permsRes.data : []);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteRoleId) return;

    const response = await rolesService.delete(deleteRoleId);
    if (isSuccessResponse(response)) {
      toast.success('Role deleted successfully');
      fetchData();
    } else {
      toast.error(response.message || 'Failed to delete role');
    }
    setDeleteRoleId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const systemRoles = roles.filter((r) => r.isSystemRole);
  const customRoles = roles.filter((r) => !r.isSystemRole);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage roles and permissions</p>
        </div>
        <button
          onClick={() => router.push('/admin/roles/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Roles</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{roles.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Custom Roles</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{customRoles.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Total Permissions
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{permissions.length}</p>
        </div>
      </div>

      {/* System Roles */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          System Roles (Protected)
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permissions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {systemRoles.map((role) => (
                <tr key={role.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {role.name}
                      </span>
                      <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded">
                        System
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {role.description}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions && role.permissions.length > 0 ? (
                        role.permissions.slice(0, 3).map((perm) => (
                          <span
                            key={perm.id}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                            title={perm.description}
                          >
                            {perm.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No permissions</span>
                      )}
                      {role.permissions && role.permissions.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Roles */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Custom Roles
        </h2>
        {customRoles.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No custom roles created yet</p>
            <button
              onClick={() => router.push('/admin/roles/create')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Role
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customRoles.map((role) => (
                  <tr key={role.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {role.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {role.description || 'No description'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.slice(0, 3).map((perm) => (
                            <span
                              key={perm.id}
                              className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded"
                              title={perm.description}
                            >
                              {perm.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No permissions</span>
                        )}
                        {role.permissions && role.permissions.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/admin/roles/edit/${role.id}`)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteRoleId(role.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <Confirm
        isOpen={deleteRoleId !== null}
        onClose={() => setDeleteRoleId(null)}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone."
        type="danger"
        onConfirm={handleDelete}
      />
    </div>
  );
}
