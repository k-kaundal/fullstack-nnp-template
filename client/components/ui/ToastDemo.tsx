'use client';

/**
 * Toast Demo Component
 * Demonstrates all toast message types and features
 */

import { toast } from '@/lib/utils';

/**
 * Demo component showing all toast variants
 */
export function ToastDemo() {
  const handleSuccess = () => {
    toast.success('User created successfully!');
  };

  const handleError = () => {
    toast.error('Failed to delete user');
  };

  const handleWarning = () => {
    toast.warning('This action cannot be undone');
  };

  const handleInfo = () => {
    toast.info('New update available');
  };

  const handleLoading = () => {
    const toastId = toast.loading('Creating user...');

    // Simulate async operation
    setTimeout(() => {
      toast.success('User created successfully!', { id: toastId });
    }, 2000);
  };

  const handlePromise = async () => {
    const promise = new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve('Success!');
        } else {
          reject(new Error('Failed!'));
        }
      }, 2000);
    });

    await toast.promise(promise, {
      loading: 'Processing...',
      success: 'Operation completed successfully!',
      error: 'Operation failed. Please try again.',
    });
  };

  const handleCustomDuration = () => {
    toast.success('This toast stays for 10 seconds', { duration: 10000 });
  };

  const handleWithAction = () => {
    toast.success('User deleted', {
      action: {
        label: 'Undo',
        onClick: () => {
          toast.info('Undo clicked!');
        },
      },
    });
  };

  return (
    <div className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Toast Demo</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Basic Toasts */}
        <button
          onClick={handleSuccess}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          Success Toast
        </button>

        <button
          onClick={handleError}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Error Toast
        </button>

        <button
          onClick={handleWarning}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
        >
          Warning Toast
        </button>

        <button
          onClick={handleInfo}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
        >
          Info Toast
        </button>

        {/* Advanced Toasts */}
        <button
          onClick={handleLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Loading Toast
        </button>

        <button
          onClick={handlePromise}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Promise Toast
        </button>

        <button
          onClick={handleCustomDuration}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          Long Duration
        </button>

        <button
          onClick={handleWithAction}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
        >
          With Action
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usage Example:</h3>
        <pre className="text-sm text-gray-700 dark:text-gray-300 overflow-x-auto">
          {`import { toast } from '@/lib/utils';

// Simple usage
toast.success('User created!');
toast.error('Failed to delete');
toast.warning('Are you sure?');
toast.info('New update available');

// With options
toast.success('Saved!', { duration: 5000 });

// Loading toast
const id = toast.loading('Saving...');
toast.success('Saved!', { id });

// Promise toast
await toast.promise(
  saveUser(),
  {
    loading: 'Saving...',
    success: 'User saved!',
    error: 'Failed to save'
  }
);`}
        </pre>
      </div>
    </div>
  );
}
