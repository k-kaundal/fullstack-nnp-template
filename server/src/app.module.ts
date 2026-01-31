import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { SeederModule } from './database/seeders/seeder.module';
import { validate } from './config/env.validation';
import { cacheConfig } from './config/cache.config';
import { mailConfig } from './config/mail.config';
import { DatabaseLogger } from './config/database-logger.config';

/**
 * Root application module
 * Configures global modules: Config, Database, Cache, Auth, Mail, and Scheduling
 */
@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: '.env',
      load: [mailConfig],
    }),
    // Schedule module for cron jobs
    ScheduleModule.forRoot(),
    // Database configuration
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const isTest = configService.get('NODE_ENV') === 'test';
        const databaseUrl = configService.get('DATABASE_URL');

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
          synchronize: configService.get('DATABASE_SYNC') === 'true' || isTest,
          logging: !isProduction,
          logger: isProduction ? undefined : new DatabaseLogger(),
          ssl: isProduction
            ? {
                rejectUnauthorized: false, // Required for most cloud providers
              }
            : false,
        };
      },
    }),
    // Cache configuration
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: cacheConfig,
    }),
    MailModule,
    AuthModule,
    UsersModule,
    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
