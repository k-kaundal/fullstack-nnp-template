import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Guard to check if RBAC feature is enabled
 * If RBAC_ENABLED=false in .env, all RBAC endpoints will be disabled
 */
@Injectable()
export class RbacEnabledGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    const isRbacEnabled =
      this.configService.get<string>('RBAC_ENABLED', 'true') !== 'false';

    if (!isRbacEnabled) {
      throw new ForbiddenException(
        'RBAC feature is disabled. Set RBAC_ENABLED=true in .env to enable role-based access control.',
      );
    }

    return true;
  }
}
