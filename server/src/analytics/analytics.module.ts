import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { VisitorLog } from './entities/visitor-log.entity';

/**
 * Analytics module for visitor tracking and statistics
 */
@Module({
  imports: [TypeOrmModule.forFeature([VisitorLog])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
