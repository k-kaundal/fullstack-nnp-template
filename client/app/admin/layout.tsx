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
      <div className="h-screen flex bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
        {/* Floating 3D Geometry Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/5 dark:to-cyan-500/5 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/5 dark:to-pink-500/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/5 dark:to-emerald-500/5 rounded-full blur-3xl animate-float-slow" />

          {/* Floating grid pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                transform: 'perspective(1000px) rotateX(60deg) scale(2)',
                transformOrigin: 'center center',
              }}
            />
          </div>
        </div>

        {/* Professional Sidebar with Real Data */}
        <Sidebar config={dynamicSidebarConfig} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen relative z-10">
          {/* Professional Header */}
          <Header config={adminHeaderConfig} />

          {/* Page Content - This is the scrollable area */}
          <main className="flex-1 overflow-y-auto bg-transparent">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
