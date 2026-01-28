/**
 * Modal Component Interfaces
 * TypeScript interfaces for Modal, Alert, and Confirmation components
 */

import { ReactNode } from 'react';

/**
 * Modal configuration
 */
export interface ModalConfig {
  /** Modal title */
  title?: string;
  /** Modal content */
  content?: ReactNode;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on ESC key */
  closeOnEsc?: boolean;
  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Footer content */
  footer?: ReactNode;
  /** Custom header */
  header?: ReactNode;
  /** Custom className for modal */
  className?: string;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  /** Alert title */
  title: string;
  /** Alert message */
  message: string | ReactNode;
  /** Alert type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Confirm button text */
  confirmText?: string;
  /** Confirm button handler */
  onConfirm?: () => void;
  /** Show icon */
  showIcon?: boolean;
}

/**
 * Confirmation dialog configuration
 */
export interface ConfirmConfig {
  /** Confirmation title */
  title: string;
  /** Confirmation message */
  message: string | ReactNode;
  /** Confirmation type (affects styling) */
  type?: 'info' | 'warning' | 'danger';
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button handler */
  onConfirm: () => void | Promise<void>;
  /** Cancel button handler */
  onCancel?: () => void;
  /** Show loading state on confirm */
  showLoading?: boolean;
}
