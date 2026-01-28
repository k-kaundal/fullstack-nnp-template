/**
 * Layout Component Props Interfaces
 */

import { ReactNode } from 'react';

/**
 * Admin layout component props
 */
export interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * Theme provider props
 */
export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}
