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
      <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Professional Sidebar */}
        <Sidebar config={adminSidebarConfig} />

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
