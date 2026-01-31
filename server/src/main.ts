import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { INestApplication } from '@nestjs/common';
import { SanitizationMiddleware } from './common/middleware/sanitization.middleware';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { VersioningInterceptor } from './common/interceptors/versioning.interceptor';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './common/logger/logger.service';
import { setupSwagger } from './config/swagger.config';
import { initializeSentry } from './config/sentry.config';

/**
 * Creates and configures the NestJS application
 * Used for both local development and serverless deployment
 *
 * @returns Configured NestJS application instance
 */
async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  // Get services
  const configService = app.get(ConfigService);
  const loggerService = app.get(LoggerService);
  const reflector = app.get(Reflector);

  // Initialize Sentry for error monitoring
  initializeSentry(configService);

  // Enable API versioning (URI-based)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global prefix (for non-versioned routes)
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // CORS configuration
  app.enableCors({
    origin: '*',
    credentials: true,
    exposedHeaders: [
      'X-Correlation-Id', // For request tracking
      'X-API-Version',
      'X-API-Deprecated',
      'X-API-Sunset',
      'X-API-Alternative',
      'Warning',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-RateLimit-Policy',
      'Retry-After',
    ],
  });

  // Global sanitization middleware
  const sanitizationMiddleware = new SanitizationMiddleware();
  app.use(sanitizationMiddleware.use.bind(sanitizationMiddleware));

  // Request logging middleware with correlation IDs
  const requestLoggingMiddleware = new RequestLoggingMiddleware(loggerService);
  app.use(requestLoggingMiddleware.use.bind(requestLoggingMiddleware));

  // Global versioning interceptor for deprecation warnings
  app.useGlobalInterceptors(new VersioningInterceptor(reflector));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter (enhanced with error codes and logging)
  app.useGlobalFilters(
    new GlobalExceptionFilter(configService, loggerService),
    new AllExceptionsFilter(), // Fallback
  );

  // Advanced Swagger documentation
  setupSwagger(app);

  return app;
}

/**
 * Bootstrap function for local development
 * Starts the application on specified port
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await createApp();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`🎮 GraphQL Playground: http://localhost:${port}/graphql`);
  logger.log(`📄 OpenAPI JSON: http://localhost:${port}/api/docs-json`);
  logger.log(`🔄 API v1: http://localhost:${port}/api/v1/`);
  logger.log(`🔄 API v2: http://localhost:${port}/api/v2/ (coming soon)`);
  logger.log(
    `📊 Error Monitoring: ${process.env.SENTRY_ENABLED === 'true' ? 'Enabled' : 'Disabled'}`,
  );
  logger.log(`📝 Structured Logging: Enabled with Winston`);
  logger.log(`🔍 Correlation IDs: Enabled for request tracking`);
}

// For Vercel serverless deployment
let cachedApp: INestApplication;

/**
 * Serverless handler for Vercel deployment
 * Creates a single cached NestJS app instance and exports it
 *
 * @returns Express app handler for Vercel
 */
export default async (req: unknown, res: unknown) => {
  if (!cachedApp) {
    cachedApp = await createApp();
    await cachedApp.init();
  }

  return cachedApp.getHttpAdapter().getInstance()(req, res);
};

bootstrap();
