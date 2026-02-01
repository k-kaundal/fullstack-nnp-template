/**
 * Admin Layout
 * Layout wrapper for admin pages with professional sidebar and header
 * Protected by authentication
 * Features dynamic sidebar with real-time user statistics
 */

'use client';

import { Sidebar, Header } from '@/components/ui';
import { ProtectedRoute } from '@/components/auth';
import { useAdminSidebarConfig } from '@/constants/admin-sidebar-dynamic';
import { useAdminHeaderConfig } from '@/constants/admin-header';
import { AdminLayoutProps } from '@/interfaces';

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Dynamic header config with user data
  const adminHeaderConfig = useAdminHeaderConfig();

  // Dynamic sidebar config with real-time user statistics
  const dynamicSidebarConfig = useAdminSidebarConfig();

  return (
    <ProtectedRoute requireAdminAccess={true}>
      <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Professional Sidebar with Real Data */}
        <Sidebar config={dynamicSidebarConfig} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Professional Header */}
          <Header config={adminHeaderConfig} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
