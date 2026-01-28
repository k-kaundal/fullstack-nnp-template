# Toast System Documentation

## Overview
The toast system uses **[Sonner](https://sonner.emilkowal.ski/)** - a beautiful, accessible toast component library with excellent dark mode support and customization options.

## Setup

### Installation
```bash
yarn add sonner
```

### Configuration
The Toaster component is configured in the root layout (`app/layout.tsx`) with these settings:
- **Position**: top-right
- **Duration**: 4000ms (4 seconds)
- **Rich Colors**: Enabled (color-coded toasts)
- **Close Button**: Enabled
- **Expand**: Disabled (keeps toasts compact)

## Usage

### Basic Toast Messages

```typescript
import { toast } from '@/lib/utils';

// Success toast
toast.success('User created successfully!');

// Error toast
toast.error('Failed to delete user');

// Warning toast
toast.warning('This action cannot be undone');

// Info toast
toast.info('New update available');
```

### Loading Toast

```typescript
import { toast } from '@/lib/utils';

// Show loading toast
const toastId = toast.loading('Creating user...');

// Later, update it to success
toast.success('User created successfully!', { id: toastId });

// Or update to error
toast.error('Failed to create user', { id: toastId });
```

### Promise Toast
Automatically handles loading → success/error states:

```typescript
import { toast } from '@/lib/utils';

await toast.promise(
  createUser(userData),
  {
    loading: 'Creating user...',
    success: 'User created successfully!',
    error: 'Failed to create user'
  }
);

// With dynamic messages
await toast.promise(
  fetchUser(id),
  {
    loading: 'Fetching user...',
    success: (user) => `Welcome ${user.name}!`,
    error: (err) => `Error: ${err.message}`
  }
);
```

### Custom Options

```typescript
import { toast } from '@/lib/utils';

// Custom duration
toast.success('This stays for 10 seconds', { duration: 10000 });

// Toast with action button
toast.success('User deleted', {
  action: {
    label: 'Undo',
    onClick: () => {
      // Handle undo action
      restoreUser();
    }
  }
});

// Custom description
toast.success('User created', {
  description: 'John Doe has been added to the system'
});
```

### Helper Functions

#### Show API Error
```typescript
import { showApiError } from '@/lib/utils';

try {
  await createUser(data);
} catch (error) {
  showApiError(error);
}
```

#### Show Validation Errors
```typescript
import { showValidationErrors } from '@/lib/utils';

const errors = {
  email: 'Email is required',
  password: 'Password must be at least 8 characters'
};

showValidationErrors(errors);
// Shows: "Email is required, Password must be at least 8 characters"
```

### Dismissing Toasts

```typescript
import { toast } from '@/lib/utils';

// Dismiss specific toast
const toastId = toast.success('Hello');
toast.dismiss(toastId);

// Dismiss all toasts
toast.dismiss();
```

## Real-World Examples

### Form Submission
```typescript
'use client';

import { useState } from 'react';
import { toast } from '@/lib/utils';

export function UserForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const toastId = toast.loading('Creating user...');
    setLoading(true);

    try {
      const response = await createUser(formData);
      toast.success('User created successfully!', { id: toastId });
      router.push('/users');
    } catch (error) {
      toast.error('Failed to create user', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### API Call with Promise Toast
```typescript
'use client';

import { toast } from '@/lib/utils';

export function DeleteButton({ userId }: { userId: string }) {
  const handleDelete = async () => {
    await toast.promise(
      deleteUser(userId),
      {
        loading: 'Deleting user...',
        success: 'User deleted successfully!',
        error: 'Failed to delete user'
      }
    );

    // Refresh or redirect
    router.refresh();
  };

  return (
    <button onClick={handleDelete}>
      Delete User
    </button>
  );
}
```

### Multiple Operations
```typescript
'use client';

import { toast } from '@/lib/utils';

export function BulkActions() {
  const handleBulkDelete = async (userIds: string[]) => {
    const toastId = toast.loading(`Deleting ${userIds.length} users...`);

    try {
      await Promise.all(userIds.map(id => deleteUser(id)));
      toast.success(`${userIds.length} users deleted`, { id: toastId });
    } catch (error) {
      toast.error('Some users could not be deleted', { id: toastId });
    }
  };

  return <button onClick={() => handleBulkDelete(selectedIds)}>...</button>;
}
```

### Form Validation
```typescript
'use client';

import { toast, showValidationErrors } from '@/lib/utils';

export function LoginForm() {
  const handleSubmit = async (formData: FormData) => {
    const errors: Record<string, string> = {};

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      showValidationErrors(errors);
      return;
    }

    // Proceed with login
    await toast.promise(
      login(email, password),
      {
        loading: 'Logging in...',
        success: 'Welcome back!',
        error: 'Invalid credentials'
      }
    );
  };

  return <form action={handleSubmit}>...</form>;
}
```

## Styling

### Custom Theme
The toast component automatically adapts to dark mode and uses your app's color scheme defined in `globals.css`:

- Success: Green tones
- Error: Red tones
- Warning: Yellow tones
- Info: Sky/Blue tones

### Custom Styles
To customize toast appearance, update the CSS in `globals.css`:

```css
/* Custom toast styling */
[data-sonner-toast] {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  /* Add your custom styles */
}
```

## Demo Component

Try the `<ToastDemo />` component to see all toast variants in action:

```typescript
import { ToastDemo } from '@/components/ui';

export default function DemoPage() {
  return <ToastDemo />;
}
```

## Best Practices

1. **Use Promise Toast for async operations** - Automatically handles loading/success/error states
2. **Keep messages concise** - Toasts should be readable at a glance
3. **Use appropriate severity** - Match toast type to message importance
4. **Don't overuse** - Too many toasts can be annoying
5. **Provide actionable feedback** - Use action buttons when undo is possible
6. **Avoid technical jargon** - Write user-friendly messages

## API Reference

### toast.success(message, options?)
Show success toast

### toast.error(message, options?)
Show error toast

### toast.warning(message, options?)
Show warning toast

### toast.info(message, options?)
Show info toast

### toast.loading(message, options?)
Show loading toast (returns toast ID)

### toast.promise(promise, messages, options?)
Track promise and show loading/success/error

### toast.dismiss(toastId?)
Dismiss specific toast or all toasts

### toast.custom(message, options?)
Show custom toast

## Options

```typescript
interface ToastOptions {
  duration?: number;           // Toast duration in ms (default: 4000)
  position?: string;           // Position on screen
  description?: string;        // Additional text below message
  action?: {                   // Action button
    label: string;
    onClick: () => void;
  };
  id?: string | number;        // Toast ID for updating
}
```

## Resources

- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [Sonner GitHub](https://github.com/emilkowalski/sonner)
