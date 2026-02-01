import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { RolesService } from './roles.service';
import { PermissionsService } from './permissions.service';
import { RolesController } from './roles.controller';
import { PermissionsController } from './permissions.controller';
import { UserRolesController } from './user-roles.controller';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { UsersModule } from '../users/users.module';

/**
 * RBAC Module for Role-Based Access Control
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]),
    UsersModule, // Import for user-role assignment
  ],
  controllers: [RolesController, PermissionsController, UserRolesController],
  providers: [RolesService, PermissionsService, RolesGuard, PermissionsGuard],
  exports: [RolesService, PermissionsService, RolesGuard, PermissionsGuard],
})
export class RbacModule {}
