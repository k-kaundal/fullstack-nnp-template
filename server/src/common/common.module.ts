import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheService } from './services/cache.service';
import { CacheWarmingService } from './services/cache-warming.service';

/**
 * Common Module
 * Provides shared services, utilities, and interceptors
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // 1 minute default
      max: 100, // Maximum number of items in cache
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [CacheService, CacheWarmingService],
  exports: [CacheService, CacheWarmingService],
})
export class CommonModule {}
