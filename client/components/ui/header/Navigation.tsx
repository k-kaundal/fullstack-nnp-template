/**
 * Navigation Component
 * Main navigation with dropdown support
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeaderNavItem, NavigationProps } from '@/interfaces';

/**
 * Main navigation with dropdown menus
 *
 * @param props - Navigation configuration
 * @returns JSX Element
 */
export function Navigation({ items }: NavigationProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const getBadgeClasses = (variant: string = 'primary') => {
    const variants = {
      primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return variants[variant as keyof typeof variants] || variants.primary;
  };

  return (
    <nav className="hidden md:flex items-center gap-1">
      {items.map((item) => {
        const isActive = pathname === item.href;

        if (item.children && item.children.length > 0) {
          return (
            <DropdownNavItem
              key={item.id}
              item={item}
              isActive={isActive}
              pathname={pathname}
              isOpen={openDropdown === item.id}
              onToggle={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
              getBadgeClasses={getBadgeClasses}
            />
          );
        }

        return (
          <NavItem
            key={item.id}
            item={item}
            isActive={isActive}
            getBadgeClasses={getBadgeClasses}
          />
        );
      })}
    </nav>
  );
}

// Single Nav Item Component
function NavItem({
  item,
  isActive,
  getBadgeClasses,
}: {
  item: HeaderNavItem;
  isActive: boolean;
  getBadgeClasses: (variant?: string) => string;
}) {
  if (item.href) {
    return (
      <Link
        href={item.href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isActive
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        } ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        {item.icon && <span className="w-5 h-5">{item.icon}</span>}
        {item.label}
        {item.badge && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${getBadgeClasses(item.badgeVariant)}`}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  }

  return (
    <button
      onClick={item.onClick}
      disabled={item.disabled}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
        isActive
          ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
      } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {item.icon && <span className="w-5 h-5">{item.icon}</span>}
      {item.label}
      {item.badge && (
        <span className={`px-2 py-0.5 text-xs rounded-full ${getBadgeClasses(item.badgeVariant)}`}>
          {item.badge}
        </span>
      )}
    </button>
  );
}

// Dropdown Nav Item Component
function DropdownNavItem({
  item,
  isActive,
  pathname,
  isOpen,
  onToggle,
  getBadgeClasses,
}: {
  item: HeaderNavItem;
  isActive: boolean;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  getBadgeClasses: (variant?: string) => string;
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (isOpen) onToggle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={onToggle}
        disabled={item.disabled}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
          isActive
            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {item.icon && <span className="w-5 h-5">{item.icon}</span>}
        {item.label}
        {item.badge && (
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${getBadgeClasses(item.badgeVariant)}`}
          >
            {item.badge}
          </span>
        )}
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && item.children && (
        <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
          {item.children.map((child) => {
            const childIsActive = pathname === child.href;

            return child.href ? (
              <Link
                key={child.id}
                href={child.href}
                onClick={onToggle}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  childIsActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${child.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
              >
                {child.icon && <span className="w-5 h-5 flex-shrink-0">{child.icon}</span>}
                <span className="flex-1">{child.label}</span>
                {child.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${getBadgeClasses(child.badgeVariant)}`}
                  >
                    {child.badge}
                  </span>
                )}
              </Link>
            ) : (
              <button
                key={child.id}
                onClick={() => {
                  if (!child.disabled && child.onClick) {
                    child.onClick();
                    onToggle();
                  }
                }}
                disabled={child.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                  childIsActive
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${child.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {child.icon && <span className="w-5 h-5 flex-shrink-0">{child.icon}</span>}
                <span className="flex-1">{child.label}</span>
                {child.badge && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${getBadgeClasses(child.badgeVariant)}`}
                  >
                    {child.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Icon Component
function ChevronDownIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
