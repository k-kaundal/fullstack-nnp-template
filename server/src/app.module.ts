import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { RbacModule } from './rbac/rbac.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ContactModule } from './contact/contact.module';
import { BlogModule } from './blog/blog.module';
import { SeederModule } from './database/seeders/seeder.module';
import { SeederService } from './database/seeders/seeder.service';
import { GraphqlAppModule } from './graphql/graphql.module';
import { LoggerModule } from './common/logger/logger.module';
import { LoggingModule } from './common/logging.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerService } from './common/logger/logger.service';
import { validate } from './config/env.validation';
import { cacheConfig } from './config/cache.config';
import { mailConfig } from './config/mail.config';
import { throttlerConfig } from './config/rate-limit.config';
import { DatabaseLogger } from './config/database-logger.config';
import { CustomThrottlerGuard } from './common/guards/throttler.guard';

// Detect serverless environment
const isServerless =
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.LAMBDA_TASK_ROOT;

// Conditionally include GraphQL module (only in non-serverless environments)
const conditionalImports = [
  // Global configuration module
  ConfigModule.forRoot({
    isGlobal: true,
    validate,
    envFilePath: '.env',
    load: [mailConfig],
  }),
  // Schedule module for cron jobs
  ScheduleModule.forRoot(),
  // Global logger module
  LoggerModule,
  // Request logging module with automatic cleanup
  LoggingModule,
  // Database configuration
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const isProduction = configService.get('NODE_ENV') === 'production';
      const isServerless =
        process.env.VERCEL ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.LAMBDA_TASK_ROOT;
      const databaseUrl = configService.get('DATABASE_URL');

      // Serverless-optimized connection pool settings
      const connectionPoolConfig = isServerless
        ? {
            // Minimal connections for serverless to avoid exhausting DB connection limits
            extra: {
              max: 1, // Maximum 1 connection per serverless instance
              min: 0, // No minimum connections
              idleTimeoutMillis: 1000, // Close idle connections after 1 second
              connectionTimeoutMillis: 3000, // 3 second connection timeout
            },
            keepConnectionAlive: false, // Don't keep connections alive in serverless
            maxQueryExecutionTime: 5000, // Kill queries taking longer than 5 seconds
          }
        : {
            // Normal server connection pool settings
            extra: {
              max: 10, // Maximum 10 connections
              min: 2, // Minimum 2 connections
              idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
            },
            keepConnectionAlive: true,
          };

      // If DATABASE_URL is provided (common in production), use it
      if (databaseUrl) {
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('DATABASE_SYNC') === 'true',
          logging: !isProduction,
          logger: isProduction ? undefined : new DatabaseLogger(),
          ssl: isProduction
            ? {
                rejectUnauthorized: false, // Required for most cloud providers
              }
            : false,
          ...connectionPoolConfig,
        };
      }

      // Otherwise, use individual connection parameters
      return {
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize:
          (configService.get('DATABASE_SYNC') === 'true' || true) ?? true,
        logging: !isProduction,
        logger: isProduction ? undefined : new DatabaseLogger(),
        ssl: isProduction
          ? {
              rejectUnauthorized: false, // Required for most cloud providers
            }
          : false,
        ...connectionPoolConfig,
      };
    },
  }),
  // Cache configuration
  CacheModule.registerAsync({
    isGlobal: true,
    inject: [ConfigService],
    useFactory: cacheConfig,
  }),
  // Rate limiting / Throttler configuration
  ThrottlerModule.forRoot(throttlerConfig),
  MailModule,
  AuthModule,
  UsersModule,
  RbacModule,
  NewsletterModule,
  AnalyticsModule,
  ContactModule,
  BlogModule,
  SeederModule,
];

// Only include GraphQL in non-serverless environments
if (!isServerless) {
  conditionalImports.push(GraphqlAppModule);
}

/**
 * Root application module
 * Configures global modules: Config, Database, Cache, Auth, Mail, Scheduling, Logging, and Error Handling
 * GraphQL is conditionally loaded (disabled in serverless environments)
 * Auto-runs seeders on startup in development/staging environments
 */
@Module({
  imports: conditionalImports,
  controllers: [AppController],
  providers: [
    AppService,
    // Apply rate limiting guard globally
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    // Apply global exception filter with dependency injection
    {
      provide: APP_FILTER,
      useFactory: (
        configService: ConfigService,
        loggerService: LoggerService,
      ) => {
        return new GlobalExceptionFilter(configService, loggerService);
      },
      inject: [ConfigService, LoggerService],
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly configService: ConfigService,
    private readonly seederService: SeederService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Lifecycle hook - runs after module initialization
   * Automatically seeds database in development/staging environments
   */
  async onModuleInit(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const autoSeed = this.configService.get<string>('AUTO_SEED', 'false');

    // Only auto-seed in development/staging or when AUTO_SEED=true
    const shouldSeed =
      autoSeed === 'true' || nodeEnv === 'development' || nodeEnv === 'staging';

    if (shouldSeed) {
      try {
        this.logger.log(
          `Auto-seeding enabled for environment: ${nodeEnv}`,
          'AppModule',
        );
        await this.seederService.runAll();
        this.logger.log('Database seeding completed successfully', 'AppModule');
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Database seeding failed: ${errorMessage}`,
          error instanceof Error ? error.stack : undefined,
          'AppModule',
        );
        // Don't throw - allow app to start even if seeding fails
      }
    } else {
      this.logger.log(
        `Auto-seeding disabled for environment: ${nodeEnv}`,
        'AppModule',
      );
    }
  }
}
