import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

/**
 * Guard to check if user has required permissions
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      return false;
    }

    // Get all permissions from user's roles
    const userPermissions = new Set<string>();
    user.roles.forEach((role: Role) => {
      role.permissions?.forEach((permission: Permission) => {
        userPermissions.add(permission.name);
      });
    });

    // Check if user has all required permissions
    return requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );
  }
}
