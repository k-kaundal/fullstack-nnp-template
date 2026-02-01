/**
 * Database Seeder Module
 * Provides database seeding functionality
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../rbac/entities/role.entity';
import { Permission } from '../../rbac/entities/permission.entity';
import { SeederService } from './seeder.service';
import { UsersSeeder } from './users.seeder';
import { RbacSeeder } from './rbac.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  providers: [SeederService, UsersSeeder, RbacSeeder],
  exports: [SeederService],
})
export class SeederModule {}
