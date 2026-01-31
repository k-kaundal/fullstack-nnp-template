import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestLog } from './entities/request-log.entity';
import { RequestLoggerService } from './services/request-logger.service';
import { LogCleanupService } from './services/log-cleanup.service';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { RequestLogsController } from './controllers/request-logs.controller';

/**
 * Logging Module
 * Handles request logging, storage, and cleanup
 */
@Module({
  imports: [TypeOrmModule.forFeature([RequestLog]), ScheduleModule.forRoot()],
  providers: [RequestLoggerService, LogCleanupService],
  controllers: [RequestLogsController],
  exports: [RequestLoggerService, LogCleanupService],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request logging middleware to all routes
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
