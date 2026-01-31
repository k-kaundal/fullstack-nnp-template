import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Email Verification Guard
 * Ensures user has verified their email before accessing protected routes
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
 * @Get('protected')
 * protectedRoute() {
 *   return 'This route requires verified email';
 * }
 * ```
 */
@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Checks if authenticated user has verified their email
   *
   * @param context - Execution context
   * @returns Promise<boolean> - True if email is verified
   * @throws UnauthorizedException if email is not verified
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before accessing this resource',
      );
    }

    return true;
  }
}
