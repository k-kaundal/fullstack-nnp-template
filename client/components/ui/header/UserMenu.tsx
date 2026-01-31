/**
 * UserMenu Component
 * User profile dropdown menu
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserMenuProps } from '@/interfaces';

/**
 * User menu dropdown with profile info and actions
 *
 * @param props - User menu configuration
 * @returns JSX Element
 */
export function UserMenu({ profile, menuItems }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="User menu"
      >
        {/* Avatar */}
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm ring-2 ring-white dark:ring-gray-800">
            {profile.initials || profile.name.charAt(0)}
          </div>
        )}

        {/* Name & Role (hidden on mobile) */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
            {profile.name}
          </p>
          {profile.role && (
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">{profile.role}</p>
          )}
        </div>

        <ChevronDownIcon
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                  {profile.initials || profile.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {profile.name}
                </p>
                {profile.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {profile.email}
                  </p>
                )}
                {profile.role && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{profile.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, _index) => (
              <div key={item.id}>
                {item.divider ? (
                  <div className="my-2 border-t border-gray-200 dark:border-gray-700" />
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      item.danger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {
                      if (item.disabled) e.preventDefault();
                      else setIsOpen(false);
                    }}
                  >
                    {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (!item.disabled && item.onClick) {
                        item.onClick();
                        setIsOpen(false);
                      }
                    }}
                    disabled={item.disabled}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                      item.danger
                        ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
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
