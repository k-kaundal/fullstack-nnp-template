/**
 * Dynamic Admin Sidebar Configuration
 * Returns sidebar config with real-time data
 */

'use client';

import { SidebarConfig } from '@/interfaces';
import { useUserStats, useRbacStats } from '@/hooks';

/**
 * Hook to get admin sidebar configuration with dynamic data
 * @returns Sidebar configuration with real user and RBAC counts
 */
export function useAdminSidebarConfig(): SidebarConfig {
  const { stats } = useUserStats();
  const { stats: rbacStats } = useRbacStats();

  return {
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        ),
      },
      {
        id: 'users',
        label: 'User Management',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ),
        children: [
          {
            id: 'users-list',
            label: 'All Users',
            href: '/admin/users',
            badge: stats.total > 0 ? String(stats.total) : undefined,
            badgeVariant: 'primary',
          },
          {
            id: 'users-active',
            label: 'Active Users',
            href: '/admin/users?status=active',
            badge: stats.active > 0 ? String(stats.active) : undefined,
            badgeVariant: 'success',
          },
          {
            id: 'users-inactive',
            label: 'Inactive Users',
            href: '/admin/users?status=inactive',
            badge: stats.inactive > 0 ? String(stats.inactive) : undefined,
            badgeVariant: 'danger',
          },
        ],
      },
      {
        id: 'rbac',
        label: 'Access Control',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
        children: [
          {
            id: 'rbac-roles',
            label: 'Roles',
            href: '/admin/roles',
            badge: rbacStats.roles.total > 0 ? String(rbacStats.roles.total) : undefined,
            badgeVariant: 'primary',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            ),
          },
          {
            id: 'rbac-permissions',
            label: 'Permissions',
            href: '/admin/permissions',
            badge:
              rbacStats.permissions.total > 0 ? String(rbacStats.permissions.total) : undefined,
            badgeVariant: 'success',
            icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            ),
          },
        ],
      },
      {
        id: 'newsletter',
        label: 'Newsletter',
        href: '/admin/newsletter',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        ),
        children: [
          {
            id: 'newsletter-subscribers',
            label: 'Subscribers',
            href: '/admin/newsletter/subscribers',
          },
          {
            id: 'newsletter-send',
            label: 'Send Newsletter',
            href: '/admin/newsletter/send',
          },
        ],
      },
      {
        id: 'settings',
        label: 'Settings',
        href: '/admin/settings',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        ),
      },
    ],
  };
}
