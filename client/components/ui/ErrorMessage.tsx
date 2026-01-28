/**
 * Error Message Component
 * Displays error messages with optional retry action
 */

import { ErrorMessageProps } from '@/interfaces';

/**
 * ErrorMessage component for displaying errors
 *
 * @param props - Component props
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * {error && <ErrorMessage message={error} onRetry={() => fetchData()} />}
 * ```
 */
export function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{message}</p>
          </div>
        </div>
        {onRetry && (
          <button onClick={onRetry} className="text-sm text-red-600 hover:text-red-800 font-medium">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
