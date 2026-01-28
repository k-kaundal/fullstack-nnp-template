/**
 * Advanced Header Component
 * Professional reusable header with modular subcomponents
 */

'use client';

import Link from 'next/link';
import { HeaderProps } from '@/interfaces';
import { CompactThemeSwitcher } from './ThemeSwitcher';
import { Navigation } from './header/Navigation';
import { NotificationsDropdown } from './header/NotificationsDropdown';
import { SearchBar } from './header/SearchBar';
import { UserMenu } from './header/UserMenu';

/**
 * Advanced modular Header component
 *
 * @param config - Header configuration object
 * @returns JSX Element
 *
 * @example
 * ```tsx
 * import { Header } from '@/components/ui';
 * import { headerConfig } from '@/constants/header';
 *
 * <Header config={headerConfig} />
 * ```
 */
export function Header({ config }: HeaderProps) {
  const {
    logo,
    navigation,
    search,
    user,
    notifications,
    showThemeSwitcher = true,
    actions,
    sticky = true,
    bordered = true,
    className = '',
  } = config;

  return (
    <header
      className={`bg-white dark:bg-gray-800 ${bordered ? 'border-b border-gray-200 dark:border-gray-700' : ''} ${
        sticky ? 'sticky top-0 z-10' : ''
      } ${className}`}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Logo and Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            {logo && (
              <Link href={logo.href || '/'} className="flex items-center">
                {logo.element}
              </Link>
            )}

            {/* Navigation */}
            {navigation && navigation.length > 0 && <Navigation items={navigation} />}
          </div>

          {/* Right section: Search, Notifications, Theme, User */}
          <div className="flex items-center gap-2">
            {/* Advanced Search */}
            {search?.enabled && (
              <SearchBar
                placeholder={search.placeholder}
                onSearch={search.onSearch}
                advanced={search.advanced}
                filters={search.filters}
                showRecent={search.showRecent}
                recentSearches={search.recentSearches}
                suggestions={search.suggestions}
                showShortcuts={search.showShortcuts}
              />
            )}

            {/* Notifications Dropdown */}
            {notifications?.enabled && (
              <NotificationsDropdown
                items={notifications.items}
                unreadCount={notifications.unreadCount}
                viewAllHref={notifications.viewAllHref}
                onMarkAllRead={notifications.onMarkAllRead}
              />
            )}

            {/* Custom Actions */}
            {actions && actions.length > 0 && (
              <div className="flex items-center gap-2">
                {actions.map((action, index) => (
                  <div key={index}>{action}</div>
                ))}
              </div>
            )}

            {/* Theme Switcher */}
            {showThemeSwitcher && <CompactThemeSwitcher />}

            {/* User Menu */}
            {user && <UserMenu profile={user.profile} menuItems={user.menuItems} />}
          </div>
        </div>
      </div>
    </header>
  );
}
