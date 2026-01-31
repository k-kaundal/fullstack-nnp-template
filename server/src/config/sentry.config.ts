import * as Sentry from '@sentry/node';
import { ConfigService } from '@nestjs/config';

/**
 * Initialize Sentry for error monitoring and performance tracking
 *
 * Features:
 * - Error tracking with stack traces
 * - Performance monitoring (traces)
 * - Profiling integration (optional - requires native bindings)
 * - Environment-based configuration
 * - Operational error filtering
 */
export function initializeSentry(configService: ConfigService): void {
  const sentryEnabled = configService.get('SENTRY_ENABLED', 'false') === 'true';

  if (!sentryEnabled) {
    console.log('📊 Sentry monitoring: Disabled');
    return;
  }

  const dsn = configService.get<string>('SENTRY_DSN');

  if (!dsn) {
    console.warn('⚠️  Sentry is enabled but SENTRY_DSN is not configured');
    return;
  }

  // Prepare integrations array
  const integrations = [Sentry.httpIntegration()];

  // Try to add profiling integration (optional - requires native bindings)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { nodeProfilingIntegration } = require('@sentry/profiling-node');
    integrations.push(nodeProfilingIntegration());
    console.log('✅ Sentry profiling enabled');
  } catch {
    console.warn(
      '⚠️  Sentry profiling unavailable (native bindings missing). Error monitoring will still work.',
    );
  }

  Sentry.init({
    dsn,
    environment: configService.get('SENTRY_ENVIRONMENT', 'development'),
    release: configService.get('APP_VERSION', '1.0.0'),
    serverName: configService.get('SENTRY_SERVER_NAME', 'unknown'),

    // Performance Monitoring
    tracesSampleRate: parseFloat(
      configService.get('SENTRY_TRACES_SAMPLE_RATE', '1.0'),
    ),

    // Profiling
    profilesSampleRate: parseFloat(
      configService.get('SENTRY_PROFILES_SAMPLE_RATE', '1.0'),
    ),

    // Integrations
    integrations,

    // Filter out operational errors (don't send to Sentry)
    beforeSend(event, hint) {
      const error = hint.originalException as Error & {
        isOperational?: boolean;
      };

      // Don't send operational errors (expected business logic errors)
      if (error?.isOperational) {
        return null;
      }

      // Sanitize sensitive data
      if (event.request) {
        // Remove authorization headers
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
      }

      return event;
    },

    // Breadcrumb filtering
    beforeBreadcrumb(breadcrumb) {
      // Don't log breadcrumbs for health check endpoints
      if (
        breadcrumb.category === 'http' &&
        breadcrumb.data?.url?.includes('/health')
      ) {
        return null;
      }

      return breadcrumb;
    },
  });

  console.log('✅ Sentry initialized successfully');
}

/**
 * Capture exception manually
 * Use this for catching and reporting errors in try-catch blocks
 */
export function captureSentryException(
  error: Error,
  context?: Record<string, unknown>,
): void {
  Sentry.captureException(error, {
    contexts: context ? { additional: context } : undefined,
  });
}

/**
 * Capture message manually
 * Use this for logging important events or warnings
 */
export function captureSentryMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>,
): void {
  Sentry.captureMessage(message, {
    level,
    contexts: context ? { additional: context } : undefined,
  });
}

/**
 * Start a performance span
 * Use this for tracking performance of specific operations
 */
export function startSentrySpan(
  name: string,
  op: string,
): ReturnType<typeof Sentry.startInactiveSpan> {
  return Sentry.startInactiveSpan({
    name,
    op,
  });
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addSentryBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level,
  });
}
