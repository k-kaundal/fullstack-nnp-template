'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

/**
 * Visitor tracking component
 * Automatically tracks page visits with IP, location, and device info
 * Should be included in root layout for site-wide tracking
 */
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Get or create session ID (browser only)
        let sessionId = '';
        if (typeof window !== 'undefined' && window.localStorage) {
          sessionId = localStorage.getItem('visitor_session_id') || '';
          if (!sessionId && crypto && crypto.randomUUID) {
            sessionId = crypto.randomUUID();
            localStorage.setItem('visitor_session_id', sessionId);
          }
        }

        // Get screen resolution
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;

        // Get language
        const language = navigator.language || 'en-US';

        // Get referrer
        const referrer = document.referrer || undefined;

        // Calculate visit duration (time since page load)
        const startTime = performance.now();

        // Track after small delay to ensure page loaded
        setTimeout(async () => {
          const visitDuration = Math.round((performance.now() - startTime) / 1000);

          // Send tracking data
          await apiClient.post('/analytics/track', {
            page: pathname,
            referrer,
            language,
            screenWidth,
            screenHeight,
            sessionId,
            visitDuration,
          });
        }, 1000); // 1 second delay
      } catch {
        // Silently fail - don't interrupt user experience
        // Analytics tracking is optional and should not block user
      }
    };

    trackVisit();
  }, [pathname]);

  // This component doesn't render anything
  return null;
}
