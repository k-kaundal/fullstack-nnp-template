# Modal, Alert, and Confirm Components

## Overview
Custom, reusable dialog components that replace native JavaScript `alert()`, `confirm()`, and `prompt()` functions.

**❌ NEVER USE:**
- `alert()` - Use `<Alert>` component instead
- `confirm()` - Use `<Confirm>` component instead
- `prompt()` - Use `<Modal>` with custom form instead

**✅ ALWAYS USE:**
- `<Modal>` - General purpose dialog
- `<Alert>` - Notification/information dialog
- `<Confirm>` - Confirmation dialog for destructive actions

## Features
- 🎨 Full dark mode support
- ⌨️ Keyboard accessible (ESC to close)
- 🖱️ Click outside to close (configurable)
- 🔄 Loading states for async operations
- 📱 Fully responsive
- 🎭 Multiple types/variants
- 🚫 Body scroll locking when open
- ♿ ARIA accessible

---

## Modal Component

### Basic Usage
```tsx
import { useState } from 'react';
import { Modal } from '@/components/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
        size="md"
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether modal is visible |
| `onClose` | `() => void` | - | Close handler |
| `title` | `string` | - | Modal title |
| `children` | `ReactNode` | - | Modal content |
| `showCloseButton` | `boolean` | `true` | Show X button |
| `closeOnOverlayClick` | `boolean` | `true` | Close on backdrop click |
| `closeOnEsc` | `boolean` | `true` | Close on ESC key |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal width |
| `footer` | `ReactNode` | - | Footer buttons/content |
| `header` | `ReactNode` | - | Custom header |
| `className` | `string` | `''` | Additional CSS classes |

### Sizes
- `sm` - 448px max-width
- `md` - 512px max-width (default)
- `lg` - 672px max-width
- `xl` - 896px max-width
- `full` - Full width with margin

### With Footer
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  footer={
    <>
      <button onClick={() => setIsOpen(false)}>Cancel</button>
      <button onClick={handleSave}>Save</button>
    </>
  }
>
  <p>Are you sure you want to continue?</p>
</Modal>
```

---

## Alert Component

### Basic Usage
```tsx
import { useState } from 'react';
import { Alert } from '@/components/ui';

function MyComponent() {
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <>
      <button onClick={() => setAlertOpen(true)}>Show Alert</button>

      <Alert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Success"
        message="Your changes have been saved successfully."
        type="success"
      />
    </>
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether alert is visible |
| `onClose` | `() => void` | - | Close handler |
| `title` | `string` | - | Alert title |
| `message` | `string \| ReactNode` | - | Alert message/content |
| `type` | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` | Alert type |
| `confirmText` | `string` | `'OK'` | Confirm button text |
| `onConfirm` | `() => void` | - | Optional confirm handler |
| `showIcon` | `boolean` | `true` | Show type icon |

### Types
- `info` - Blue color scheme with info icon
- `success` - Green color scheme with checkmark icon
- `warning` - Yellow color scheme with warning icon
- `error` - Red color scheme with error icon

### Examples

#### Info Alert
```tsx
<Alert
  isOpen={isOpen}
  onClose={onClose}
  title="Information"
  message="Your session will expire in 5 minutes."
  type="info"
/>
```

#### Success Alert
```tsx
<Alert
  isOpen={isOpen}
  onClose={onClose}
  title="Success"
  message="User created successfully!"
  type="success"
/>
```

#### Warning Alert
```tsx
<Alert
  isOpen={isOpen}
  onClose={onClose}
  title="Warning"
  message="This action may affect other users."
  type="warning"
/>
```

#### Error Alert
```tsx
<Alert
  isOpen={isOpen}
  onClose={onClose}
  title="Error"
  message="Failed to save changes. Please try again."
  type="error"
/>
```

---

## Confirm Component

### Basic Usage
```tsx
import { useState } from 'react';
import { Confirm } from '@/components/ui';

function MyComponent() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = async () => {
    // Perform delete operation
    await deleteUser();
  };

  return (
    <>
      <button onClick={() => setConfirmOpen(true)}>Delete</button>

      <Confirm
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        type="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
```

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Whether dialog is visible |
| `onClose` | `() => void` | - | Close handler |
| `title` | `string` | - | Dialog title |
| `message` | `string \| ReactNode` | - | Dialog message/content |
| `type` | `'info' \| 'warning' \| 'danger'` | `'warning'` | Dialog type |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `onConfirm` | `() => void \| Promise<void>` | - | Confirm handler (can be async) |
| `onCancel` | `() => void` | - | Optional cancel handler |
| `showLoading` | `boolean` | `true` | Show spinner during async confirm |

### Types
- `info` - Blue color scheme with info icon
- `warning` - Yellow color scheme with warning icon (default)
- `danger` - Red color scheme with alert icon

### Examples

#### Delete Confirmation (Danger)
```tsx
<Confirm
  isOpen={isOpen}
  onClose={onClose}
  title="Delete User"
  message="Are you sure you want to delete this user? This action cannot be undone."
  type="danger"
  confirmText="Delete"
  onConfirm={async () => {
    await deleteUser(userId);
  }}
/>
```

#### Warning Confirmation
```tsx
<Confirm
  isOpen={isOpen}
  onClose={onClose}
  title="Unsaved Changes"
  message="You have unsaved changes. Are you sure you want to leave?"
  type="warning"
  confirmText="Leave"
  cancelText="Stay"
  onConfirm={() => router.push('/dashboard')}
/>
```

#### Info Confirmation
```tsx
<Confirm
  isOpen={isOpen}
  onClose={onClose}
  title="Send Email"
  message="This will send an email to all selected users. Continue?"
  type="info"
  confirmText="Send"
  onConfirm={async () => {
    await sendBulkEmail(selectedUsers);
  }}
/>
```

---

## Advanced Patterns

### Helper Functions Pattern
Create helper functions to manage modal state:

```tsx
'use client';

import { useState } from 'react';
import { Alert, Confirm } from '@/components/ui';

function MyPage() {
  // Alert state
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  // Confirm state
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning' as 'info' | 'warning' | 'danger',
    onConfirm: () => {},
  });

  // Helper: Show alert
  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setAlertState({ isOpen: true, title, message, type });
  };

  // Helper: Show confirmation
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'info' | 'warning' | 'danger' = 'warning'
  ) => {
    setConfirmState({ isOpen: true, title, message, type, onConfirm });
  };

  // Usage
  const handleDelete = () => {
    showConfirm(
      'Delete Item',
      'Are you sure you want to delete this item?',
      async () => {
        await deleteItem();
        showAlert('Success', 'Item deleted successfully', 'success');
      },
      'danger'
    );
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>

      {/* Alert */}
      <Alert
        isOpen={alertState.isOpen}
        onClose={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
      />

      {/* Confirm */}
      <Confirm
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        title={confirmState.title}
        message={confirmState.message}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
}
```

### Custom Hook Pattern
Create a reusable hook for dialog management:

```tsx
// hooks/useDialogs.ts
import { useState } from 'react';

export function useDialogs() {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
  });

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning' as 'info' | 'warning' | 'danger',
    onConfirm: () => {},
  });

  const showAlert = (
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    setAlertState({ isOpen: true, title, message, type });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'info' | 'warning' | 'danger' = 'warning'
  ) => {
    setConfirmState({ isOpen: true, title, message, type, onConfirm });
  };

  const closeAlert = () => setAlertState(prev => ({ ...prev, isOpen: false }));
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, isOpen: false }));

  return {
    alertState,
    confirmState,
    showAlert,
    showConfirm,
    closeAlert,
    closeConfirm,
  };
}

// Usage in component
function MyComponent() {
  const { alertState, confirmState, showAlert, showConfirm, closeAlert, closeConfirm } = useDialogs();

  const handleAction = () => {
    showConfirm(
      'Confirm Action',
      'Are you sure?',
      () => showAlert('Success', 'Action completed', 'success'),
      'warning'
    );
  };

  return (
    <>
      <button onClick={handleAction}>Do Action</button>

      <Alert {...alertState} onClose={closeAlert} />
      <Confirm {...confirmState} onClose={closeConfirm} />
    </>
  );
}
```

---

## Best Practices

### ✅ DO
- Use `<Alert>` for notifications and information
- Use `<Confirm>` for destructive actions (delete, irreversible changes)
- Use `<Modal>` for forms and complex content
- Close modals after successful operations
- Show loading state during async operations
- Use appropriate types (danger for delete, warning for caution)

### ❌ DON'T
- Never use `alert()`, `confirm()`, or `prompt()`
- Don't use Alert for confirmations (use Confirm instead)
- Don't forget to handle loading states for async operations
- Don't make modals too large (use appropriate sizes)
- Don't put too much content in Alert/Confirm (use Modal instead)

---

## Styling Customization

All components support dark mode automatically through Tailwind CSS dark mode classes.

### Custom Colors
Colors are defined in the components but can be overridden using the `className` prop on Modal:

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Custom Style"
  className="bg-purple-100 dark:bg-purple-900"
>
  <p>Custom styled modal</p>
</Modal>
```

---

## Accessibility

All components follow accessibility best practices:
- Keyboard navigation (ESC to close)
- Focus management
- ARIA labels
- Screen reader friendly
- Proper contrast ratios
- Click outside detection
