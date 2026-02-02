'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ThemeSwitcher } from '@/components/ui';
import { NewsletterSubscription } from '@/components/newsletter';
import { useAuthContext } from '@/lib/providers/auth-provider';
import { fadeInUp, scaleIn, staggerContainer, useParallax } from '@/lib/utils/scroll-animations';
const AI3DBackground = dynamic(() => import('@/components/3d').then((mod) => mod.AI3DBackground), {
  ssr: false,
});

/**
 * Enhanced home page with 3D WebGL animations and parallax scroll effects
 * Features floating geometries, particle systems, and smooth momentum scrolling
 */
export default function HomeClient() {
  const { isAuthenticated, user, isLoading } = useAuthContext();

  // Refs for parallax effects
  const parallaxRef1 = useRef(null);
  const parallaxRef2 = useRef(null);
  const parallaxRef3 = useRef(null);

  // Refs for scroll animations
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const themeRef = useRef(null);

  // Parallax transforms
  const y1 = useParallax(50);
  const y2 = useParallax(80);
  const y3 = useParallax(100);

  // In-view animations
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const themeInView = useInView(themeRef, { once: true, amount: 0.3 });

  return (
    <div className="min-h-screen bg-transparent">
      {/* AI-Themed 3D Background - Fixed to viewport */}
      <Suspense fallback={null}>
        <AI3DBackground />
      </Suspense>

      {/* Hero Section with AI-Themed 3D Background */}
      <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-cyan-50/10 to-white/80 dark:from-transparent dark:via-cyan-950/10 dark:to-gray-950/80 min-h-screen flex items-center">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-grid-gray-900/[0.04] dark:bg-grid-white/[0.02] bg-size-[30px_30px] z-[1]" />

        {/* Parallax Gradient Orbs */}
        <motion.div
          ref={parallaxRef1}
          style={{ y: y1 }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-linear-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl z-[1]"
        />
        <motion.div
          ref={parallaxRef2}
          style={{ y: y2 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-linear-to-r from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl z-[1]"
        />
        <motion.div
          ref={parallaxRef3}
          style={{ y: y3 }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-linear-to-r from-cyan-400/15 to-blue-400/15 dark:from-cyan-600/8 dark:to-blue-600/8 rounded-full blur-3xl z-[1]"
        />

        {/* Hero Content */}
        <div className="relative z-20 mx-auto max-w-7xl px-6 lg:px-8 py-32">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Title */}
            <motion.h1
              className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl bg-clip-text text-transparent bg-linear-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-200 dark:to-purple-200"
              variants={fadeInUp}
            >
              Production-Ready Fullstack Template
            </motion.h1>

            {/* Description */}
            <motion.p
              className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-gray-600 dark:text-gray-400"
              variants={fadeInUp}
            >
              Built with <span className="font-semibold text-gray-900 dark:text-white">NestJS</span>
              , <span className="font-semibold text-gray-900 dark:text-white">Next.js 16</span>, and{' '}
              <span className="font-semibold text-gray-900 dark:text-white">PostgreSQL</span>.
              Features authentication, RBAC, GraphQL, blog CMS, newsletter system, and everything
              you need for enterprise applications.
            </motion.p>

            {/* Status Badge */}
            {!isLoading && isAuthenticated && user && (
              <motion.div
                className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-full shadow-lg"
                variants={scaleIn}
              >
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Authenticated as <span className="font-bold">{user.email}</span>
                </p>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
              variants={fadeInUp}
            >
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
                    href="/profile"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
                  >
                    My Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-linear-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-xl"
                  >
                    <span className="relative flex items-center gap-2">
                      Get Started Free
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </span>
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg
            className="w-6 h-6 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </section>

      {/* Features Section with Scroll Animations */}
      <section
        ref={featuresRef}
        className="relative py-24 bg-gray-50/30 dark:bg-gray-900/30 overflow-hidden"
      >
        {/* Animated 3D Background with Gradients */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-600 dark:to-cyan-600 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </div>
        {/* Floating Grid Pattern */}
        <div className="absolute inset-0 bg-grid-gray-900/[0.03] dark:bg-grid-white/[0.02] bg-size-[40px_40px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full"
            >
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Feature-Rich
              </span>
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Everything You Need
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 dark:text-gray-400">
              Professional features ready for production deployment
            </motion.p>
          </motion.div>

          <motion.div
            className="mx-auto grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4"
            initial="hidden"
            animate={featuresInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
          >
            {/* Authentication */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
            </motion.div>

            {/* RBAC */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-purple-500 dark:hover:ring-purple-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                  Role-based access control with permissions, guards, decorators, and dynamic
                  sidebar navigation
                </p>
              </div>
            </motion.div>

            {/* GraphQL */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-pink-500 dark:hover:ring-pink-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
            </motion.div>

            {/* Database */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-green-500 dark:hover:ring-green-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Database
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  PostgreSQL with TypeORM, migrations, seeders, query logging, and optimization
                  tools
                </p>
              </div>
            </motion.div>

            {/* Rate Limiting */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-orange-500 dark:hover:ring-orange-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
            </motion.div>

            {/* Email System */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-red-500 dark:hover:ring-red-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                  Nodemailer integration with templates, verification emails, password reset, and
                  bulk sending
                </p>
              </div>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-cyan-500 dark:hover:ring-cyan-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
            </motion.div>

            {/* Blog CMS */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-purple-500 dark:hover:ring-purple-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Blog CMS
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Full-featured blog with TipTap WYSIWYG editor, categories, tags, SEO, and public
                  blog pages
                </p>
              </div>
            </motion.div>

            {/* Visitor Analytics */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
            </motion.div>

            {/* Request Logging */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-teal-500 dark:hover:ring-teal-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
            </motion.div>

            {/* Contact Form */}
            <Link
              href="/contact"
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-pink-500 dark:hover:ring-pink-400 transition-all duration-300 block cursor-pointer overflow-hidden"
            >
              <div className="relative z-10">
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
              </div>
            </Link>

            {/* API Documentation */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-indigo-500 dark:hover:ring-indigo-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                  Auto-generated Swagger docs, API versioning, response decorators, and
                  comprehensive examples
                </p>
              </div>
            </motion.div>

            {/* Type Safety */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-yellow-500 dark:hover:ring-yellow-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                  Full TypeScript with strict mode, shared interfaces, validation decorators, and
                  type guards
                </p>
              </div>
            </motion.div>

            {/* Error Handling */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-rose-500 dark:hover:ring-rose-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
            </motion.div>

            {/* Caching */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-teal-500 dark:hover:ring-teal-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Caching
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Cache manager with TTL, automatic invalidation, statistics caching, and
                  performance optimization
                </p>
              </div>
            </motion.div>

            {/* Testing */}
            <motion.div
              variants={fadeInUp}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-xl hover:ring-2 hover:ring-violet-500 dark:hover:ring-violet-400 transition-all duration-300 overflow-hidden"
            >
              <div className="relative z-10">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Testing
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  Jest unit tests, E2E tests, coverage reports, test database setup, and
                  comprehensive examples
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="relative py-16 bg-white/30 dark:bg-gray-900/30 border-y border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
      >
        {/* 3D Depth Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-950/20 dark:via-transparent dark:to-purple-950/20" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 dark:from-blue-600/5 dark:to-purple-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 dark:from-purple-600/5 dark:to-pink-600/5 rounded-full blur-3xl" />
        <motion.div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
          initial="hidden"
          animate={statsInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <motion.div variants={scaleIn} className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">70+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Error Codes</p>
            </motion.div>
            <motion.div variants={scaleIn} className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">16+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Features</p>
            </motion.div>
            <motion.div variants={scaleIn} className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">100%</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">TypeScript</p>
            </motion.div>
            <motion.div variants={scaleIn} className="text-center">
              <p className="text-4xl font-bold text-gray-900 dark:text-white">80%+</p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Test Coverage</p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Theme Section */}
      <section
        ref={themeRef}
        className="relative py-20 bg-white/30 dark:bg-gray-900/30 overflow-hidden"
      >
        {/* 3D Floating Elements Background */}
        <div className="absolute inset-0 opacity-30 dark:opacity-15">
          <div
            className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 dark:from-blue-600 dark:to-cyan-600 rounded-2xl blur-2xl animate-bounce"
            style={{ animationDuration: '3s' }}
          />
          <div
            className="absolute top-20 right-20 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-full blur-2xl animate-bounce"
            style={{ animationDuration: '4s', animationDelay: '0.5s' }}
          />
          <div
            className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-400 dark:from-green-600 dark:to-emerald-600 rounded-lg blur-2xl animate-bounce"
            style={{ animationDuration: '3.5s', animationDelay: '1s' }}
          />
        </div>
        <motion.div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8"
          initial="hidden"
          animate={themeInView ? 'visible' : 'hidden'}
          variants={staggerContainer}
        >
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full"
            >
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
            </motion.div>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Choose Your Preferred Theme
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Seamless dark mode with persistent preferences across all components
            </motion.p>
            <motion.div variants={scaleIn} className="flex justify-center">
              <ThemeSwitcher />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Newsletter Section */}
      <section className="relative py-24 bg-linear-to-b from-gray-50/30 to-white/30 dark:from-gray-900/30 dark:to-gray-950/30 overflow-hidden">
        {/* 3D Wave Effect with Particles */}
        <div className="absolute inset-0 opacity-20">
          <svg
            className="absolute bottom-0 w-full h-64"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              className="text-blue-500/10 dark:text-blue-400/5"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          <svg
            className="absolute top-0 w-full h-64 transform rotate-180"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              className="text-purple-500/10 dark:text-purple-400/5"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          {/* Animated Glowing Particles */}
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full animate-ping" />
          <div
            className="absolute top-1/3 right-1/3 w-3 h-3 bg-purple-500 dark:bg-purple-400 rounded-full animate-ping"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-pink-500 dark:bg-pink-400 rounded-full animate-ping"
            style={{ animationDelay: '1s' }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-2 h-2 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-ping"
            style={{ animationDelay: '1.5s' }}
          />
          <div
            className="absolute top-3/4 left-1/3 w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-ping"
            style={{ animationDelay: '2s' }}
          />
        </div>
        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <NewsletterSubscription />
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50/30 dark:bg-gray-900/30 border-t border-gray-200/50 dark:border-gray-800/50 py-12">
        <motion.div
          className="mx-auto max-w-7xl px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={staggerContainer}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div variants={fadeInUp}>
              <Image
                className="dark:invert opacity-50"
                src="/next.svg"
                alt="Next.js logo"
                width={100}
                height={20}
              />
            </motion.div>
            <motion.p
              variants={fadeInUp}
              className="text-center text-sm text-gray-500 dark:text-gray-400"
            >
              © {new Date().getFullYear()} Fullstack NestJS + Next.js + PostgreSQL Template
            </motion.p>
            <motion.p
              variants={fadeInUp}
              className="text-center text-xs text-gray-400 dark:text-gray-500"
            >
              Built with ❤️ using modern technologies
            </motion.p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}
