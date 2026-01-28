/**
 * Theme Provider
 * Official Next.js theme management using next-themes package
 * @see https://github.com/pacocoursey/next-themes
 */

'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ThemeProviderProps } from '@/interfaces';

/**
 * Theme Provider component using next-themes
 * Provides theme context to the entire application
 *
 * @param props - Component props
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}

/**
 * Re-export useTheme hook from next-themes for convenience
 * @example
 * ```tsx
 * const { theme, setTheme, resolvedTheme } = useTheme();
 * ```
 */
export { useTheme } from 'next-themes';

