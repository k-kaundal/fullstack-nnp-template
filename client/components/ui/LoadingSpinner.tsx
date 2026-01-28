/**
 * Loading Spinner Component
 * Displays a loading indicator
 */

import { LoadingSpinnerProps } from '@/interfaces';

/**
 * LoadingSpinner component for indicating loading state
 *
 * @param props - Component props
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * {isLoading && <LoadingSpinner size="md" />}
 * ```
 */
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin`}
      ></div>
    </div>
  );
}
