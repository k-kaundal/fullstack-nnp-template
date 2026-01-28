/**
 * Theme related interfaces
 */

import { Theme } from '@/enums';

/**
 * Theme context value
 * Used for managing theme state across the application
 */
export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}
