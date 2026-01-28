/**
 * UI Component Props Interfaces
 * Centralized interface definitions for all UI components
 */

import { ReactNode } from 'react';
import { PaginationMeta } from '@/types';
import { User } from './user.interface';
import { SidebarItem } from './sidebar.interface';
import { HeaderNavItem, UserProfile, UserMenuItem, NotificationItem, SearchFilter, SearchSuggestion } from './header.interface';

/**
 * Loading spinner component props
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

/**
 * Error message component props
 */
export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Pagination component props
 */
export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Alert component props
 */
export interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string | ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  showIcon?: boolean;
  confirmText?: string;
  onConfirm?: () => void;
}

/**
 * Confirm dialog component props
 */
export interface ConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | ReactNode;
  type?: 'info' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  onCancel?: () => void;
  showLoading?: boolean;
  loading?: boolean;
}

/**
 * Modal component props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
  header?: ReactNode;
  footer?: ReactNode;
}

/**
 * User card component props
 */
export interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

/**
 * Sidebar props
 */
export interface SidebarProps {
  config: {
    header?: {
      title?: string;
      subtitle?: string;
      logo?: ReactNode;
    };
    items: SidebarItem[];
    footer?: ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  };
  className?: string;
}

/**
 * Sidebar menu item props
 */
export interface SidebarMenuItemProps {
  item: SidebarItem;
  collapsed: boolean;
  pathname: string;
  level: number;
}

/**
 * Header props
 */
export interface HeaderProps {
  config: {
    logo?: {
      src?: string;
      alt?: string;
      href?: string;
      text?: string;
      element?: ReactNode;
    };
    navigation?: HeaderNavItem[];
    search?: {
      enabled?: boolean;
      placeholder?: string;
      onSearch?: (query: string) => void;
      advanced?: boolean;
      filters?: SearchFilter[];
      showRecent?: boolean;
      recentSearches?: string[];
      suggestions?: SearchSuggestion[];
      showShortcuts?: boolean;
    };
    notifications?: {
      enabled?: boolean;
      items?: NotificationItem[];
      unreadCount?: number;
      viewAllHref?: string;
      onMarkAllRead?: () => void;
    };
    user?: {
      profile: UserProfile;
      menuItems: UserMenuItem[];
    };
    showThemeSwitcher?: boolean;
    actions?: ReactNode[];
    sticky?: boolean;
    bordered?: boolean;
    className?: string;
  };
}

/**
 * Search bar props
 */
export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  advanced?: boolean;
  filters?: SearchFilter[];
  showRecent?: boolean;
  recentSearches?: string[];
  suggestions?: SearchSuggestion[];
  showShortcuts?: boolean;
}

/**
 * Notifications dropdown props
 */
export interface NotificationsDropdownProps {
  items?: NotificationItem[];
  unreadCount?: number;
  viewAllHref?: string;
  onMarkAllRead?: () => void;
}

/**
 * User menu props
 */
export interface UserMenuProps {
  profile: UserProfile;
  menuItems: UserMenuItem[];
}

/**
 * Navigation props
 */
export interface NavigationProps {
  items: HeaderNavItem[];
}
