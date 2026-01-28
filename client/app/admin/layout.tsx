/**
 * Admin Layout
 * Layout wrapper for admin pages with professional sidebar and header
 */

import { Sidebar, Header } from '@/components/ui';
import { adminSidebarConfig } from '@/constants/admin-sidebar';
import { adminHeaderConfig } from '@/constants/admin-header';
import { AdminLayoutProps } from '@/interfaces';

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
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
  );
}
