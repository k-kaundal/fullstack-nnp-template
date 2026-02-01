/**
 * Hook for fetching user statistics
 * Used for dynamic sidebar badges and dashboard data
 */

import { useState, useEffect } from 'react';
import { usersService } from '@/lib/api/users.service';
import { isSuccessResponse } from '@/lib/utils';

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  todayRegistered: number;
}

/**
 * Custom hook to fetch user statistics
 * @returns User statistics and loading state
 */
export function useUserStats() {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    todayRegistered: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await usersService.getStatistics();
        if (isSuccessResponse(response)) {
          setStats(response.data);
        }
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
