'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

/**
 * Smooth scroll provider using Lenis
 * Provides momentum-based smooth scrolling for public pages
 * Disabled on admin routes to allow normal scroll behavior
 *
 * @param children - Child components
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  // Don't apply smooth scroll to admin, auth, or profile routes
  const isAdminRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/profile');

  useEffect(() => {
    // Skip smooth scroll for admin routes
    if (isAdminRoute) {
      return;
    }

    // Initialize Lenis for public pages only
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Request animation frame loop
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, [isAdminRoute]);

  return <>{children}</>;
}
