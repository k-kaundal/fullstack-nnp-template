/**
 * Database Seeder Module
 * Provides database seeding functionality
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { SeederService } from './seeder.service';
import { UsersSeeder } from './users.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SeederService, UsersSeeder],
  exports: [SeederService],
})
export class SeederModule {}
