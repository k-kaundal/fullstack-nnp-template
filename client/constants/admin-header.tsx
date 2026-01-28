/**
 * Admin Header Configuration
 * Configuration for the admin panel header
 */

'use client';

import { HeaderConfig } from '@/interfaces';
import { toast } from '@/lib/utils';

export const adminHeaderConfig: HeaderConfig = {
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
      badge: 125,
      badgeVariant: 'primary',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'content',
      label: 'Content',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: [
        {
          id: 'posts',
          label: 'Posts',
          href: '/admin/posts',
          badge: 45,
          badgeVariant: 'success',
        },
        {
          id: 'pages',
          label: 'Pages',
          href: '/admin/pages',
        },
        {
          id: 'media',
          label: 'Media Library',
          href: '/admin/media',
        },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/admin/analytics',
      badge: 'New',
      badgeVariant: 'warning',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
    advanced: true,
    showRecent: true,
    recentSearches: ['John Doe', 'Active users', 'Settings'],
    suggestions: [
      {
        id: '1',
        text: 'John Doe',
        category: 'Users',
        onClick: () => toast.info('Navigate to John Doe'),
      },
      {
        id: '2',
        text: 'Dashboard Settings',
        category: 'Settings',
        onClick: () => toast.info('Navigate to Dashboard Settings'),
      },
      {
        id: '3',
        text: 'All Posts',
        category: 'Content',
        onClick: () => toast.info('Navigate to Posts'),
      },
    ],
    filters: [
      {
        id: 'type',
        label: 'Content Type',
        type: 'select',
        options: [
          { value: 'users', label: 'Users' },
          { value: 'posts', label: 'Posts' },
          { value: 'pages', label: 'Pages' },
        ],
        onChange: (value) => toast.info(`Filter changed: ${value}`),
      },
      {
        id: 'status',
        label: 'Status',
        type: 'checkbox',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' },
        ],
        onChange: (value) => toast.info(`Status filter: ${value}`),
      },
    ],
    showShortcuts: true,
  },

  notifications: {
    enabled: true,
    unreadCount: 3,
    items: [
      {
        id: '1',
        title: 'New user registered',
        message: 'John Doe just signed up',
        time: '5 minutes ago',
        read: false,
        type: 'info',
      },
      {
        id: '2',
        title: 'Server update complete',
        message: 'All systems are up to date',
        time: '1 hour ago',
        read: false,
        type: 'success',
      },
      {
        id: '3',
        title: 'Storage warning',
        message: 'Database storage is 85% full',
        time: '2 hours ago',
        read: false,
        type: 'warning',
      },
      {
        id: '4',
        title: 'Backup completed',
        message: 'Daily backup finished successfully',
        time: '1 day ago',
        read: true,
        type: 'success',
      },
    ],
    viewAllHref: '/admin/notifications',
    onMarkAllRead: () => {
      toast.success('All notifications marked as read');
    },
  },

  showThemeSwitcher: true,

  user: {
    profile: {
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'Administrator',
      initials: 'AU',
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
        id: 'help',
        label: 'Help & Support',
        href: '/admin/help',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        onClick: () => {
          toast.info('Signing out...');
        },
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
