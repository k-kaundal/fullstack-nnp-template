'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/lib/utils';
import { isSuccessResponse } from '@/lib/utils';
import { Permission } from '@/interfaces';
import { LoadingSpinner } from '@/components/ui';
import { permissionsService } from '@/lib/api/permissions.service';

/**
 * Admin page for viewing permissions
 * Displays all available permissions grouped by resource
 */
export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        const response = await permissionsService.getAll();

        if (isSuccessResponse(response)) {
          // API returns { permissions: Permission[], grouped: Record<string, Permission[]> }
          const permissionsData = response.data.permissions || [];
          setPermissions(permissionsData);

          if (permissionsData.length === 0) {
            toast.info('No permissions found in the system');
          }
        } else {
          toast.error(response.message || 'Failed to load permissions');
          setPermissions([]);
        }
      } catch {
        toast.error('An error occurred while loading permissions');
        setPermissions([]);
      }
      setIsLoading(false);
    };

    void fetchPermissions();
  }, []);

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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Permissions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View all available permissions in the system
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Total Permissions
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            {permissions.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
            Resource Categories
          </h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {Object.keys(groupedPermissions).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Admin Only</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            <svg className="w-8 h-8 inline" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </p>
        </div>
      </div>

      {/* Permissions by Resource */}
      {permissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            No Permissions Found
          </h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            There are no permissions available in the system yet.
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
            Check the browser console for API response details.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, perms]) => (
            <div
              key={resource}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4">
                <h2 className="text-xl font-semibold text-white capitalize">
                  {resource} Permissions
                </h2>
                <p className="text-blue-100 text-sm mt-1">{perms.length} permission(s)</p>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {perms.map((perm) => (
                  <div
                    key={perm.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                            {perm.name}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                            {perm.action}
                          </span>
                        </div>
                        {perm.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            {perm.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            Resource:
                          </span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {perm.resource}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
              About Permissions
            </h3>
            <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
              <p>
                Permissions define what actions users can perform in the system. They are assigned
                to roles, and users inherit permissions from their assigned roles. Only
                administrators can create and manage permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
