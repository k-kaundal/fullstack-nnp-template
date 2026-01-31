'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/ui';
import { useAuthContext } from '@/lib/providers/auth-provider';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-gray-950 border-x border-gray-200 dark:border-gray-800 sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-gray-900 dark:text-white">
            Fullstack NestJS + Next.js + PostgreSQL Template
          </h1>
          <p className="max-w-md text-lg leading-8 text-gray-600 dark:text-gray-400">
            A production-ready fullstack template with authentication, session management, and best
            practices.
          </p>

          {/* User Status */}
          {!isLoading && isAuthenticated && user && (
            <div className="mt-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Logged in as <span className="font-semibold">{user.email}</span>
              </p>
            </div>
          )}

          {/* Theme Switcher */}
          <div className="mt-4 w-full">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">
              Choose Theme:
            </p>
            <ThemeSwitcher />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full">
          {!isLoading && isAuthenticated ? (
            <>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-900 dark:bg-white px-5 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors md:w-[158px]"
                href="/admin"
              >
                Admin Panel
              </Link>
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border-2 border-gray-900 dark:border-white px-5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:w-[158px]"
                href="/admin/users"
              >
                Users
              </Link>
            </>
          ) : (
            <>
              <Link
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-900 dark:bg-white px-5 text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-100 transition-colors md:w-[158px]"
                href="/auth/login"
              >
                Login
              </Link>
              <Link
                className="flex h-12 w-full items-center justify-center rounded-full border-2 border-gray-900 dark:border-white px-5 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:w-[158px]"
                href="/auth/register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
