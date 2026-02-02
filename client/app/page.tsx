'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ThemeSwitcher } from '@/components/ui';
import { NewsletterSubscription } from '@/components/newsletter';
import { useAuthContext } from '@/lib/providers/auth-provider';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-grid-gray-900/[0.04] dark:bg-grid-white/[0.02] bg-size-[30px_30px]" />

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-linear-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-linear-to-r from-pink-400/20 to-orange-400/20 dark:from-pink-600/10 dark:to-orange-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32 lg:py-40 lg:px-8">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8 animate-fade-in">
              <div className="relative">
                <Image
                  className="dark:invert"
                  src="/next.svg"
                  alt="Next.js logo"
                  width={180}
                  height={36}
                  priority
                />
                <div className="absolute -inset-4 bg-linear-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-400/20 dark:to-purple-400/20 blur-2xl -z-10" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl mb-6 animate-fade-in-up">
              Production-Ready
              <span className="block mt-2 text-transparent bg-clip-text bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400">
                Fullstack Template
              </span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-gray-600 dark:text-gray-400 animate-fade-in-up animation-delay-100">
              Built with <span className="font-semibold text-gray-900 dark:text-white">NestJS</span>
              , <span className="font-semibold text-gray-900 dark:text-white">Next.js 16</span>, and{' '}
              <span className="font-semibold text-gray-900 dark:text-white">PostgreSQL</span>.
              Features authentication, RBAC, GraphQL, newsletter system, and everything you need for
              enterprise applications.
            </p>

            {/* Status Badge */}
            {!isLoading && isAuthenticated && user && (
              <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-full shadow-lg animate-fade-in-up animation-delay-200">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Authenticated as <span className="font-bold">{user.email}</span>
                </p>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              {!isLoading && isAuthenticated ? (
                <>
                  <Link
                    href="/admin"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-100 dark:text-gray-900 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <span className="relative flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      Dashboard
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/admin/users"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all hover:scale-105 shadow-lg"
                  >
                    Manage Users
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-pink-600 dark:text-pink-400 bg-white dark:bg-gray-800 border-2 border-pink-600 dark:border-pink-400 rounded-full hover:bg-pink-600 hover:text-white dark:hover:bg-pink-400 dark:hover:text-gray-900 transition-all hover:scale-105 shadow-lg"
                  >
                    Contact Us
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-100 dark:text-gray-900 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <span className="relative flex items-center gap-2">
                      Get Started
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-2 border-gray-900 dark:border-white rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all hover:scale-105 shadow-lg"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-pink-600 dark:text-pink-400 bg-white dark:bg-gray-800 border-2 border-pink-600 dark:border-pink-400 rounded-full hover:bg-pink-600 hover:text-white dark:hover:bg-pink-400 dark:hover:text-gray-900 transition-all hover:scale-105 shadow-lg"
                  >
                    Contact Us
                  </Link>
                </>
              )}
            </div>

            {/* Tech Stack Pills */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-3 animate-fade-in-up animation-delay-400">
              <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                TypeScript
              </span>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                NestJS
              </span>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                Next.js 16
              </span>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                React 19
              </span>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                PostgreSQL
              </span>
              <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
              Everything Included
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Production-Ready Features
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              All the tools and features you need to build enterprise-grade applications
            </p>
          </div>

          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
            {/* Authentication */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Authentication
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                JWT auth with refresh tokens, email verification, password reset, and multi-device
                session management
              </p>
            </div>

            {/* RBAC */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-purple-500 dark:hover:ring-purple-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 dark:bg-purple-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                RBAC System
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Role-based access control with permissions, guards, decorators, and dynamic sidebar
                navigation
              </p>
            </div>

            {/* GraphQL */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-pink-500 dark:hover:ring-pink-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600 dark:bg-pink-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                GraphQL API
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Full GraphQL support with playground, schema-first design, resolvers, and type
                generation
              </p>
            </div>

            {/* Database */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-green-500 dark:hover:ring-green-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 dark:bg-green-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Database</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                PostgreSQL with TypeORM, migrations, seeders, query logging, and optimization tools
              </p>
            </div>

            {/* Rate Limiting */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-orange-500 dark:hover:ring-orange-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 dark:bg-orange-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Rate Limiting
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                IP and user-based rate limiting with custom tiers, RFC 6585 headers, and automatic
                retries
              </p>
            </div>

            {/* Email System */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-red-500 dark:hover:ring-red-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 dark:bg-red-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Email System
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Nodemailer integration with templates, verification emails, password reset, and bulk
                sending
              </p>
            </div>

            {/* Newsletter */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-cyan-500 dark:hover:ring-cyan-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-600 dark:bg-cyan-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Newsletter
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Complete newsletter system with subscriptions, templates, bulk sending, and
                analytics
              </p>
            </div>

            {/* Visitor Analytics */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 dark:bg-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Visitor Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Google Analytics-style dashboard with IP tracking, geolocation, device detection,
                and interactive charts
              </p>
            </div>

            {/* Request Logging */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-teal-500 dark:hover:ring-teal-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 dark:bg-teal-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Request Logging
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                HTTP request tracking with performance metrics, filtering, search, and automated
                cleanup management
              </p>
            </div>

            {/* Contact Form */}
            <Link
              href="/contact"
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-pink-500 dark:hover:ring-pink-400 transition-all duration-300 block cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-600 dark:bg-pink-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Contact Form
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Public contact form with admin dashboard, status tracking, and automated email
                notifications to admin
              </p>
            </Link>

            {/* API Documentation */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Documentation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Auto-generated Swagger docs, API versioning, response decorators, and comprehensive
                examples
              </p>
            </div>

            {/* Type Safety */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-600 dark:bg-yellow-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Type Safety
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Full TypeScript with strict mode, shared interfaces, validation decorators, and type
                guards
              </p>
            </div>

            {/* Error Handling */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-rose-500 dark:hover:ring-rose-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-600 dark:bg-rose-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Handling
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                70+ error codes, custom exceptions, Winston logging, correlation IDs, and Sentry
                integration
              </p>
            </div>

            {/* Caching */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-teal-500 dark:hover:ring-teal-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-600 dark:bg-teal-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Caching</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Cache manager with TTL, automatic invalidation, statistics caching, and performance
                optimization
              </p>
            </div>

            {/* Testing */}
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-violet-500 dark:hover:ring-violet-400 transition-all duration-300">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 dark:bg-violet-500 mb-4 group-hover:scale-110 transition-transform">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Testing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Jest unit tests, E2E tests, coverage reports, test database setup, and comprehensive
                examples
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Dark Mode Included
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Preferred Theme
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Seamless dark mode with persistent preferences across all components
            </p>
            <div className="flex justify-center">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 bg-linear-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <NewsletterSubscription />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">70+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Error Codes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">12+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Features</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">100%</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">TypeScript</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">80%+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Test Coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4">
            <Image
              className="dark:invert opacity-50"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
            />
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Fullstack NestJS + Next.js + PostgreSQL Template
            </p>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              Built with ❤️ using modern technologies
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
