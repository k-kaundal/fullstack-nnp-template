import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../entities/role.entity';

/**
 * Guard to check if user has required roles
 * If RBAC_ENABLED=false, this guard will be skipped
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Skip role checking if RBAC is disabled
    const isRbacEnabled =
      this.configService.get<string>('RBAC_ENABLED', 'true') !== 'false';

    if (!isRbacEnabled) {
      return true; // Allow access when RBAC is disabled
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!user.roles || user.roles.length === 0) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. You have no roles assigned.`,
      );
    }

    // Check if user has any of the required roles
    const userRoleNames = user.roles.map((role: Role) => role.name);
    const hasRole = requiredRoles.some((role) => userRoleNames.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your roles: ${userRoleNames.join(', ')}.`,
      );
    }

    return true;
  }
}
