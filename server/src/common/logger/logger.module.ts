import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerService } from './logger.service';

/**
 * Logger Module
 * Provides Winston-based logging globally across the application
 *
 * Features:
 * - Structured logging with Winston
 * - Daily log rotation
 * - Multiple log levels
 * - JSON format for production
 * - Colored console output for development
 * - Correlation ID support
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
