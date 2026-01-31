/**
 * Admin Layout
 * Layout wrapper for admin pages with professional sidebar and header
 * Protected by authentication
 */

'use client';

import { Sidebar, Header } from '@/components/ui';
import { ProtectedRoute } from '@/components/auth';
import { adminSidebarConfig } from '@/constants/admin-sidebar';
import { useAdminHeaderConfig } from '@/constants/admin-header';
import { AdminLayoutProps } from '@/interfaces';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const adminHeaderConfig = useAdminHeaderConfig();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Professional Sidebar */}
        <Sidebar config={adminSidebarConfig} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Professional Header */}
          <Header config={adminHeaderConfig} />

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
