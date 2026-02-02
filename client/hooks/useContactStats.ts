/**
 * Hook for fetching contact statistics
 * Used for dynamic sidebar badges
 */

import { useState, useEffect } from 'react';
import { contactService } from '@/lib/api/contact.service';
import { isSuccessResponse } from '@/lib/utils';
import { ContactStats } from '@/interfaces';

/**
 * Custom hook to fetch contact statistics
 * @returns Contact statistics and loading state
 */
export function useContactStats() {
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    today: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await contactService.getStatistics();
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
