/**
 * Toast Utility
 * Wrapper around sonner toast library with custom styling
 */

import { toast as sonnerToast, ExternalToast } from 'sonner';

/**
 * Toast utility with custom styling and positioning
 */
export const toast = {
  /**
   * Show success toast message
   *
   * @param message - Success message to display
   * @param options - Additional toast options
   * @returns Toast ID for managing the toast
   *
   * @example
   * ```typescript
   * toast.success('User created successfully');
   * ```
   */
  success: (message: string, options?: ExternalToast) => {
    return sonnerToast.success(message, {
      ...options,
      className: 'toast-success',
    });
  },

  /**
   * Show error toast message
   *
   * @param message - Error message to display
   * @param options - Additional toast options
   * @returns Toast ID for managing the toast
   *
   * @example
   * ```typescript
   * toast.error('Failed to create user');
   * ```
   */
  error: (message: string, options?: ExternalToast) => {
    return sonnerToast.error(message, {
      ...options,
      className: 'toast-error',
    });
  },

  /**
   * Show warning toast message
   *
   * @param message - Warning message to display
   * @param options - Additional toast options
   * @returns Toast ID for managing the toast
   *
   * @example
   * ```typescript
   * toast.warning('This action cannot be undone');
   * ```
   */
  warning: (message: string, options?: ExternalToast) => {
    return sonnerToast.warning(message, {
      ...options,
      className: 'toast-warning',
    });
  },

  /**
   * Show info toast message
   *
   * @param message - Info message to display
   * @param options - Additional toast options
   * @returns Toast ID for managing the toast
   *
   * @example
   * ```typescript
   * toast.info('New update available');
   * ```
   */
  info: (message: string, options?: ExternalToast) => {
    return sonnerToast.info(message, {
      ...options,
      className: 'toast-info',
    });
  },

  /**
   * Show loading toast message
   *
   * @param message - Loading message to display
   * @param options - Additional toast options
   * @returns Toast ID for updating the toast later
   *
   * @example
   * ```typescript
   * const toastId = toast.loading('Creating user...');
   * // Later update:
   * toast.success('User created!', { id: toastId });
   * ```
   */
  loading: (message: string, options?: ExternalToast) => {
    return sonnerToast.loading(message, options);
  },

  /**
   * Show promise-based toast (loading → success/error)
   *
   * @param promise - Promise to track
   * @param messages - Messages for different states with optional toast options
   * @returns Promise result
   *
   * @example
   * ```typescript
   * await toast.promise(
   *   createUser(data),
   *   {
   *     loading: 'Creating user...',
   *     success: 'User created successfully',
   *     error: 'Failed to create user'
   *   }
   * );
   * ```
   */
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    } & ExternalToast
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * Dismiss a specific toast or all toasts
   *
   * @param toastId - Optional toast ID to dismiss specific toast
   *
   * @example
   * ```typescript
   * const id = toast.success('Hello');
   * toast.dismiss(id); // Dismiss specific toast
   * toast.dismiss(); // Dismiss all toasts
   * ```
   */
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },

  /**
   * Show custom toast message
   *
   * @param message - Custom message to display
   * @param options - Additional toast options
   * @returns Toast ID for managing the toast
   *
   * @example
   * ```typescript
   * toast.custom('Custom message', { duration: 5000 });
   * ```
   */
  custom: (message: string, options?: ExternalToast) => {
    return sonnerToast(message, options);
  },
};

/**
 * Helper function to parse API errors and show toast
 *
 * @param error - Error from API call
 * @returns void
 *
 * @example
 * ```typescript
 * try {
 *   await createUser(data);
 * } catch (error) {
 *   showApiError(error);
 * }
 * ```
 */
export const showApiError = (error: unknown): void => {
  if (error && typeof error === 'object' && 'message' in error) {
    toast.error(error.message as string);
  } else if (typeof error === 'string') {
    toast.error(error);
  } else {
    toast.error('An unexpected error occurred');
  }
};

/**
 * Helper function to show validation errors
 *
 * @param errors - Record of field errors
 * @returns void
 *
 * @example
 * ```typescript
 * showValidationErrors({
 *   email: 'Email is required',
 *   password: 'Password must be at least 8 characters'
 * });
 * ```
 */
export const showValidationErrors = (errors: Record<string, string>): void => {
  const errorMessages = Object.values(errors).join(', ');
  toast.error(errorMessages);
};
