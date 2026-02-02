/**
 * Hook for fetching newsletter statistics
 * Used for dynamic sidebar badges
 */

import { useState, useEffect } from 'react';
import { newsletterService } from '@/lib/api/newsletter.service';
import { isSuccessResponse } from '@/lib/utils';

export interface NewsletterStats {
  total: number;
  active: number;
  inactive: number;
  todaySubscribed: number;
}

/**
 * Custom hook to fetch newsletter statistics
 * @returns Newsletter statistics and loading state
 */
export function useNewsletterStats() {
  const [stats, setStats] = useState<NewsletterStats>({
    total: 0,
    active: 0,
    inactive: 0,
    todaySubscribed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await newsletterService.getStatistics();
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
