/**
 * Admin Sidebar Configuration
 * Navigation items and structure for admin panel
 */

import { SidebarConfig } from '@/interfaces';

/**
 * Admin sidebar navigation configuration
 */
export const adminSidebarConfig: SidebarConfig = {
  header: {
    title: 'Admin Panel',
    subtitle: 'Management System',
    logo: (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center text-white font-bold text-sm">
        A
      </div>
    ),
  },
  collapsible: true,
  defaultCollapsed: false,
  items: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'users',
      label: 'User Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      children: [
        {
          id: 'users-list',
          label: 'All Users',
          href: '/admin/users',
          badge: '125',
          badgeVariant: 'primary',
        },
        {
          id: 'users-active',
          label: 'Active Users',
          href: '/admin/users/active',
          badge: '98',
          badgeVariant: 'success',
        },
        {
          id: 'users-pending',
          label: 'Pending Approval',
          href: '/admin/users/pending',
          badge: '12',
          badgeVariant: 'warning',
        },
        {
          id: 'users-roles',
          label: 'Roles & Permissions',
          href: '/admin/users/roles',
        },
      ],
    },
    {
      id: 'content',
      label: 'Content',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      children: [
        {
          id: 'content-posts',
          label: 'Posts',
          href: '/admin/content/posts',
          badge: '45',
        },
        {
          id: 'content-pages',
          label: 'Pages',
          href: '/admin/content/pages',
        },
        {
          id: 'content-media',
          label: 'Media Library',
          href: '/admin/content/media',
        },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: '/admin/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      badge: 'New',
      badgeVariant: 'success',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      children: [
        {
          id: 'settings-general',
          label: 'General',
          href: '/admin/settings/general',
        },
        {
          id: 'settings-security',
          label: 'Security',
          href: '/admin/settings/security',
        },
        {
          id: 'settings-integrations',
          label: 'Integrations',
          href: '/admin/settings/integrations',
        },
        {
          id: 'settings-notifications',
          label: 'Notifications',
          href: '/admin/settings/notifications',
        },
      ],
    },
  ],
};
