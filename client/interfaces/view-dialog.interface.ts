/**
 * View Dialog Interfaces
 * Type definitions for advanced view/detail dialog component
 */

import { ReactNode } from 'react';

/**
 * Field value type - can be primitive or complex
 */
export type ViewFieldValue = string | number | boolean | Date | null | undefined | ReactNode;

/**
 * Configuration for a single view field
 */
export interface ViewField {
  /** Unique field identifier */
  id: string;
  /** Field label to display */
  label: string;
  /** Field value - can be primitive or React node */
  value: ViewFieldValue;
  /** Custom render function for the value */
  render?: (value: ViewFieldValue) => ReactNode;
  /** Field type for built-in rendering */
  type?: 'text' | 'email' | 'date' | 'datetime' | 'boolean' | 'status' | 'badge' | 'link' | 'custom';
  /** Whether field value is copyable */
  copyable?: boolean;
  /** Custom className for field wrapper */
  className?: string;
  /** Span full width (for longer content) */
  fullWidth?: boolean;
  /** Hide field conditionally */
  hidden?: boolean;
}

/**
 * Configuration for a section/group of fields
 */
export interface ViewSection {
  /** Section identifier */
  id: string;
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Fields in this section */
  fields: ViewField[];
  /** Section icon */
  icon?: ReactNode;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Whether section is initially collapsed */
  defaultCollapsed?: boolean;
}

/**
 * Action button configuration for view dialog
 */
export interface ViewAction {
  /** Action identifier */
  id: string;
  /** Button label */
  label: string;
  /** Action handler */
  onClick: () => void | Promise<void>;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  /** Button icon */
  icon?: ReactNode;
  /** Whether action is loading */
  loading?: boolean;
  /** Whether action is disabled */
  disabled?: boolean;
}

/**
 * Status badge configuration for status fields
 */
export interface StatusConfig {
  /** Status value */
  value: string | boolean;
  /** Status label to display */
  label: string;
  /** Status color variant */
  variant: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

/**
 * Complete configuration for ViewDialog component
 */
export interface ViewDialogConfig {
  /** Whether dialog is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Dialog title */
  title: string;
  /** Dialog subtitle/description */
  subtitle?: string;
  /** Fields to display (flat structure) */
  fields?: ViewField[];
  /** Sections to display (grouped structure) */
  sections?: ViewSection[];
  /** Actions/buttons at bottom */
  actions?: ViewAction[];
  /** Dialog size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Show close button */
  showCloseButton?: boolean;
  /** Custom className */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Custom footer content */
  footer?: ReactNode;
}
