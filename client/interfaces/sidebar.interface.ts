/**
 * Sidebar Navigation Interfaces
 * Type definitions for sidebar navigation items
 */

import { ReactNode } from 'react';

/**
 * Sidebar navigation item interface
 * Supports nested submenus and icons
 */
export interface SidebarItem {
  /** Unique identifier for the menu item */
  id: string;
  /** Display label */
  label: string;
  /** Navigation path */
  href?: string;
  /** Icon component or SVG element */
  icon?: ReactNode;
  /** Badge text (e.g., "New", "5") */
  badge?: string;
  /** Badge color variant */
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  /** Submenu items */
  children?: SidebarItem[];
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Custom onClick handler (overrides href navigation) */
  onClick?: () => void;
}

/**
 * Sidebar configuration interface
 */
export interface SidebarConfig {
  /** Navigation items */
  items: SidebarItem[];
  /** Sidebar header/branding */
  header?: {
    title: string;
    subtitle?: string;
    logo?: ReactNode;
  };
  /** Footer content */
  footer?: ReactNode;
  /** Whether sidebar is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}
