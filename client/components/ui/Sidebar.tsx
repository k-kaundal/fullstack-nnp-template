/**
 * Advanced Sidebar Component
 * Professional, reusable sidebar with multi-level menu support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SidebarItem, SidebarProps, SidebarMenuItemProps } from '@/interfaces';

/**
 * Professional Sidebar Component
 * Features: Multi-level menus, icons, badges, collapsible, dark mode
 */
export function Sidebar({ config, className = '' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(config.defaultCollapsed ?? false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    if (config.collapsible !== false) {
      setCollapsed(!collapsed);
    }
  };

  return (
    <aside
      className={`
        relative h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-all duration-300 ease-in-out flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}
        ${className}
      `}
    >
      {/* Header */}
      {config.header && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              {config.header.logo && <div className="flex-shrink-0">{config.header.logo}</div>}
              {!collapsed && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {config.header.title}
                  </h2>
                  {config.header.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {config.header.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            {config.collapsible !== false && !collapsed && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Collapse sidebar"
              >
                <ChevronLeftIcon />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapse Toggle (when collapsed) */}
      {config.collapsible !== false && collapsed && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 z-10"
          aria-label="Expand sidebar"
        >
          <ChevronRightIcon />
        </button>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {config.items.map((item) => (
          <SidebarMenuItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            pathname={pathname}
            level={0}
          />
        ))}
      </nav>

      {/* Footer */}
      {config.footer && !collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">{config.footer}</div>
      )}
    </aside>
  );
}

/**
 * Sidebar Menu Item Component
 * Supports nested submenus with smooth animations
 */
function SidebarMenuItem({ item, collapsed, pathname, level }: SidebarMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname || pathname.startsWith(item.href + '/');
  const paddingLeft = level * 12 + 12;

  const handleClick = (e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }

    if (item.onClick) {
      e.preventDefault();
      item.onClick();
      return;
    }

    if (hasChildren) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  const menuItemClasses = `
    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg
    transition-all duration-200 cursor-pointer
    ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
    }
    ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${collapsed ? 'justify-center' : ''}
  `;

  const content = (
    <>
      {/* Icon */}
      {item.icon && (
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">{item.icon}</span>
      )}

      {/* Label and Badge */}
      {!collapsed && (
        <>
          <span className="flex-1 text-sm font-medium truncate">{item.label}</span>

          {item.badge && (
            <span
              className={`
                px-2 py-0.5 text-xs font-semibold rounded-full
                ${getBadgeClasses(item.badgeVariant)}
              `}
            >
              {item.badge}
            </span>
          )}

          {/* Submenu indicator */}
          {hasChildren && (
            <span className="flex-shrink-0 transition-transform duration-200">
              {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
            </span>
          )}
        </>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          {item.label}
          {item.badge && <span className="ml-2 text-xs">({item.badge})</span>}
        </div>
      )}
    </>
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link href={item.href} className={menuItemClasses} onClick={handleClick}>
          {content}
        </Link>
      ) : (
        <div
          className={menuItemClasses}
          onClick={handleClick}
          style={{ paddingLeft: collapsed ? undefined : `${paddingLeft}px` }}
        >
          {content}
        </div>
      )}

      {/* Submenu */}
      {hasChildren && !collapsed && (
        <div
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="mt-1 space-y-1">
            {item.children!.map((child: SidebarItem) => (
              <SidebarMenuItem
                key={child.id}
                item={child}
                collapsed={collapsed}
                pathname={pathname}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Get badge color classes based on variant
 */
function getBadgeClasses(variant?: 'primary' | 'success' | 'warning' | 'danger') {
  switch (variant) {
    case 'success':
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
    case 'danger':
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    case 'primary':
    default:
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
  }
}

/**
 * Icon Components
 */
function ChevronLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
