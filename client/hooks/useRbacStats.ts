/**
 * Hook for fetching RBAC statistics (Roles and Permissions)
 * Used for dynamic sidebar badges
 */

import { useState, useEffect } from 'react';
import { rolesService } from '@/lib/api/roles.service';
import { permissionsService } from '@/lib/api/permissions.service';
import { isSuccessResponse } from '@/lib/utils';

export interface RbacStats {
  roles: {
    total: number;
    system: number;
    custom: number;
  };
  permissions: {
    total: number;
    resources: number;
  };
}

/**
 * Custom hook to fetch RBAC statistics
 * @returns RBAC statistics and loading state
 */
export function useRbacStats() {
  const [stats, setStats] = useState<RbacStats>({
    roles: {
      total: 0,
      system: 0,
      custom: 0,
    },
    permissions: {
      total: 0,
      resources: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [rolesResponse, permissionsResponse] = await Promise.all([
          rolesService.getStatistics(),
          permissionsService.getStatistics(),
        ]);

        const newStats: RbacStats = {
          roles: {
            total: 0,
            system: 0,
            custom: 0,
          },
          permissions: {
            total: 0,
            resources: 0,
          },
        };

        if (isSuccessResponse(rolesResponse)) {
          newStats.roles = rolesResponse.data;
        }

        if (isSuccessResponse(permissionsResponse)) {
          newStats.permissions = permissionsResponse.data;
        }

        setStats(newStats);
      } catch {
        // Silent fail for statistics
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();

    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  return { stats, isLoading };
}
