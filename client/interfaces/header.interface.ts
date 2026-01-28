/**
 * Header Component Interfaces
 * TypeScript interfaces for the reusable Header component
 */

import { ReactNode } from 'react';

/**
 * Search filter interface for advanced search
 */
export interface SearchFilter {
  /** Filter ID */
  id: string;
  /** Filter label */
  label: string;
  /** Filter type */
  type: 'select' | 'checkbox' | 'date' | 'range';
  /** Filter options (for select/checkbox) */
  options?: { value: string; label: string }[];
  /** Current value */
  value?: string | string[] | Date | { min: number; max: number };
  /** On change handler */
  onChange?: (value: string | string[] | Date | { min: number; max: number }) => void;
}

/**
 * Search suggestion interface
 */
export interface SearchSuggestion {
  /** Suggestion ID */
  id: string;
  /** Suggestion text */
  text: string;
  /** Suggestion category */
  category?: string;
  /** Suggestion icon */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Header navigation item interface
 */
export interface HeaderNavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation href */
  href?: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Badge text or count */
  badge?: string | number;
  /** Badge color variant */
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger';
  /** Click handler (alternative to href) */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Child items for dropdowns */
  children?: HeaderNavItem[];
}

/**
 * User menu item interface
 */
export interface UserMenuItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Navigation href */
  href?: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Click handler (alternative to href) */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Show divider after this item */
  divider?: boolean;
  /** Danger style (for logout, delete actions) */
  danger?: boolean;
}

/**
 * User profile information interface
 */
export interface UserProfile {
  /** User's full name */
  name: string;
  /** User's email */
  email?: string;
  /** User's avatar URL */
  avatar?: string;
  /** User's role or title */
  role?: string;
  /** User's initials (fallback for avatar) */
  initials?: string;
}

/**
 * Notification item interface
 */
export interface NotificationItem {
  /** Unique identifier */
  id: string;
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Timestamp */
  time: string;
  /** Read status */
  read: boolean;
  /** Optional link */
  href?: string;
  /** Notification type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Optional icon */
  icon?: ReactNode;
}

/**
 * Header configuration interface
 */
export interface HeaderConfig {
  /** Logo or branding */
  logo?: {
    /** Logo image or component */
    element: ReactNode;
    /** Logo href (usually home) */
    href?: string;
    /** Alt text for logo */
    alt?: string;
  };
  /** Navigation items */
  navigation?: HeaderNavItem[];
  /** Enable search functionality */
  search?: {
    /** Enable search */
    enabled: boolean;
    /** Search placeholder */
    placeholder?: string;
    /** Search handler */
    onSearch?: (query: string) => void;
    /** Enable advanced search */
    advanced?: boolean;
    /** Search filters */
    filters?: SearchFilter[];
    /** Show recent searches */
    showRecent?: boolean;
    /** Recent searches list */
    recentSearches?: string[];
    /** Search suggestions */
    suggestions?: SearchSuggestion[];
    /** Show search shortcuts */
    showShortcuts?: boolean;
  };
  /** User profile and menu */
  user?: {
    /** User profile info */
    profile: UserProfile;
    /** User menu items */
    menuItems: UserMenuItem[];
  };
  /** Notifications */
  notifications?: {
    /** Enable notifications */
    enabled: boolean;
    /** Notification items */
    items?: NotificationItem[];
    /** Unread count */
    unreadCount?: number;
    /** View all notifications link */
    viewAllHref?: string;
    /** Mark all as read handler */
    onMarkAllRead?: () => void;
  };
  /** Show theme switcher */
  showThemeSwitcher?: boolean;
  /** Additional actions (custom buttons) */
  actions?: ReactNode[];
  /** Sticky header */
  sticky?: boolean;
  /** Show border bottom */
  bordered?: boolean;
  /** Custom CSS classes */
  className?: string;
}
