/**
 * Admin Header Configuration
 * Configuration for the admin panel header with dynamic user data
 */

'use client';

import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { HeaderConfig } from '@/interfaces';
import { toast } from '@/lib/utils';

/**
 * Hook to get admin header configuration with current user data
 *
 * @returns Header configuration
 */
export function useAdminHeaderConfig(): HeaderConfig {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch {
      // Error already handled in AuthProvider
    }
  };

  return {
    logo: {
      element: (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
            Admin
          </span>
        </div>
      ),
      href: '/admin',
      alt: 'Admin Panel',
    },

    navigation: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/admin',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
      {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
    ],

    search: {
      enabled: true,
      placeholder: 'Search users, content, settings...',
      onSearch: (query) => {
        toast.info(`Searching for: ${query}`);
      },
    },

    notifications: {
      enabled: true,
      unreadCount: 0,
      items: [],
      viewAllHref: '/admin/notifications',
      onMarkAllRead: () => {
        toast.success('All notifications marked as read');
      },
    },

    showThemeSwitcher: true,

    user: {
      profile: {
        name: user ? `${user.firstName} ${user.lastName}` : 'User',
        email: user?.email || '',
        role: user?.isActive ? 'Active User' : 'Inactive User',
        initials: user?.firstName && user?.lastName
          ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
          : user?.email
            ? user.email[0].toUpperCase()
            : 'U',
      },
      menuItems: [
        {
          id: 'profile',
          label: 'Your Profile',
          href: '/admin/profile',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
        {
          id: 'settings',
          label: 'Settings',
          href: '/admin/settings',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          id: 'divider',
          label: '',
          divider: true,
        },
        {
          id: 'logout',
          label: 'Sign out',
          onClick: handleLogout,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          ),
          danger: true,
        },
      ],
    },

    sticky: true,
    bordered: true,
  };
}
