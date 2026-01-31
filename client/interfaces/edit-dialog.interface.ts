import { ReactNode } from 'react';

/**
 * Field types supported by EditDialog
 */
export type EditFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'file'
  | 'custom';

/**
 * Select option for dropdown/radio fields
 */
export interface EditFieldOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * Validation rule for a field
 */
export interface ValidationRule {
  required?: boolean | string; // true or custom error message
  min?: number | { value: number; message: string };
  max?: number | { value: number; message: string };
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  validate?: (value: unknown) => boolean | string; // Custom validation function
}

/**
 * Single field configuration
 */
export interface EditField {
  id: string;
  name: string;
  label: string;
  type: EditFieldType;
  placeholder?: string;
  defaultValue?: unknown;
  value?: unknown;
  options?: EditFieldOption[]; // For select/radio fields
  validation?: ValidationRule;
  disabled?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  fullWidth?: boolean; // Span full width in grid
  helpText?: string; // Helper text below field
  prefix?: ReactNode; // Icon or text before input
  suffix?: ReactNode; // Icon or text after input
  rows?: number; // For textarea
  accept?: string; // For file input
  multiple?: boolean; // For file/select
  min?: number | string; // For number/date inputs
  max?: number | string; // For number/date inputs
  step?: number | string; // For number input
  render?: (
    field: EditField,
    value: unknown,
    onChange: (value: unknown) => void,
    error?: string
  ) => ReactNode; // Custom render
  className?: string;
}

/**
 * Section grouping fields
 */
export interface EditSection {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  fields: EditField[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

/**
 * Action button in dialog footer
 */
export interface EditAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  icon?: ReactNode;
  onClick: (formData: Record<string, unknown>) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * EditDialog configuration
 */
export interface EditDialogConfig {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields?: EditField[]; // Flat list of fields
  sections?: EditSection[]; // Grouped fields
  actions?: EditAction[];
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  loading?: boolean;
  onSubmit?: (formData: Record<string, unknown>) => void | Promise<void>;
  onChange?: (field: string, value: unknown, allValues: Record<string, unknown>) => void;
  footer?: ReactNode;
  initialValues?: Record<string, unknown>;
}
