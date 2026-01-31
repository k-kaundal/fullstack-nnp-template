import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../../users/entities/user.entity';
import { TokenBlacklist } from '../entities/token-blacklist.entity';
import { JwtPayload } from '../interfaces/auth.interface';

/**
 * JWT Authentication Strategy
 * Validates JWT tokens and retrieves user information
 * Checks token blacklist to prevent use of revoked tokens
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      passReqToCallback: true, // Pass request to validate method
    });
  }

  /**
   * Validates JWT payload and checks if token is blacklisted
   *
   * @param req - Express request object
   * @param payload - Decoded JWT payload
   * @returns Promise<JwtPayload> - Validated user payload
   * @throws UnauthorizedException if token is blacklisted or user not found
   */
  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'] as string;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    // Check if token is blacklisted
    const isBlacklisted = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });

    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Verify user exists and is active
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Return payload to be attached to request.user
    return {
      sub: payload.sub,
      email: payload.email,
    };
  }
}
