import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Response, Request } from 'express';
import * as crypto from 'crypto';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TokenBlacklist } from './entities/token-blacklist.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from './interfaces/auth.interface';
import { DeviceInfo } from './interfaces/session.interface';
import { ApiResponse } from '../common/utils/api-response.util';
import { MailService } from '../mail/mail.service';
import { SessionService } from './session.service';

/**
 * Service for managing authentication operations
 * Handles user registration, login, token management, password reset, and email verification
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Register a new user account
   *
   * @param registerDto - User registration data
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with user data and tokens
   */
  async register(
    registerDto: RegisterDto,
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Registering new user: ${registerDto.email}`);

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email already exists',
        });
      }

      // Generate email verification token
      const verificationToken = this.generateToken();
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24); // 24 hours

      // Create user
      const user = this.userRepository.create({
        ...registerDto,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        isEmailVerified: false,
      });

      const savedUser = await this.userRepository.save(user);

      // Send verification email
      try {
        await this.mailService.sendEmailVerification(
          savedUser.email,
          savedUser.firstName,
          verificationToken,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send verification email: ${emailError.message}`,
        );
        // Continue registration even if email fails
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(
        savedUser,
        req,
      );

      // Remove password from response

      const { password: _password, ...userWithoutPassword } = savedUser;

      this.logger.log(`User registered successfully: ${savedUser.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        message:
          'Registration successful. Please check your email to verify your account.',
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        meta: {
          user_id: savedUser.id,
          created_at: savedUser.createdAt,
          email_verification_required: true,
        },
      });
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Login user with email and password
   *
   * @param loginDto - Login credentials
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with user data and tokens
   */
  async login(
    loginDto: LoginDto,
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Login attempt for user: ${loginDto.email}`);

      // Find user with password
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'password',
          'isActive',
          'isEmailVerified',
          'createdAt',
          'updatedAt',
        ],
      });

      if (!user) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
        });
      }

      // Check if account is active
      if (!user.isActive) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(loginDto.password);

      if (!isPasswordValid) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid email or password',
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(
        user,
        req,
      );

      // Remove password from response

      const { password: _password, ...userWithoutPassword } = user;

      this.logger.log(`User logged in successfully: ${user.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        meta: {
          user_id: user.id,
          is_email_verified: user.isEmailVerified,
        },
      });
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Logout user by blacklisting their access token
   *
   * @param token - JWT access token to blacklist
   * @param userId - User ID from JWT payload
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response confirming logout
   */
  async logout(
    token: string,
    userId: string,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Logout request for user: ${userId}`);

      // Decode token to get expiration
      const decoded = this.jwtService.decode(token) as JwtPayload;
      const expiresAt = new Date(decoded.exp * 1000);

      // Add token to blacklist
      const blacklistedToken = this.tokenBlacklistRepository.create({
        token,
        userId,
        expiresAt,
        reason: 'logout',
      });

      await this.tokenBlacklistRepository.save(blacklistedToken);

      // Revoke all refresh tokens for this user
      await this.refreshTokenRepository.update(
        { userId, isRevoked: false },
        { isRevoked: true },
      );

      this.logger.log(`User logged out successfully: ${userId}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Logout successful',
        data: null,
        meta: {
          user_id: userId,
          logged_out_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Logout failed',
      });
    }
  }

  /**
   * Refresh access token using refresh token
   *
   * @param refreshTokenString - Refresh token
   * @param req - Express request object
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with new tokens
   */
  async refreshAccessToken(
    refreshTokenString: string,
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log('Refresh token request');

      // Find refresh token in database
      const refreshToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshTokenString },
        relations: ['user'],
      });

      if (!refreshToken) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid refresh token',
        });
      }

      // Check if token is revoked
      if (refreshToken.isRevoked) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Refresh token has been revoked',
        });
      }

      // Check if token is expired
      if (new Date() > refreshToken.expiresAt) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Refresh token has expired',
        });
      }

      // Check if user is active
      if (!refreshToken.user.isActive) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'User account is inactive',
        });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(refreshToken.user, req);

      // Revoke old refresh token
      refreshToken.isRevoked = true;
      await this.refreshTokenRepository.save(refreshToken);

      this.logger.log(
        `Access token refreshed successfully for user: ${refreshToken.userId}`,
      );

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
        meta: {
          user_id: refreshToken.userId,
          refreshed_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * Request password reset
   *
   * @param forgotPasswordDto - Email for password reset
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response confirming email sent
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(
        `Password reset requested for: ${forgotPasswordDto.email}`,
      );

      const user = await this.userRepository.findOne({
        where: { email: forgotPasswordDto.email },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        this.logger.log(
          `Password reset requested for non-existent email: ${forgotPasswordDto.email}`,
        );
        return ApiResponse.success(res, {
          statusCode: HttpStatus.OK,
          message:
            'If an account with that email exists, a password reset link has been sent.',
          data: null,
        });
      }

      // Generate password reset token
      const resetToken = this.generateToken();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hour

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await this.userRepository.save(user);

      // Send password reset email
      try {
        await this.mailService.sendPasswordReset(
          user.email,
          user.firstName,
          resetToken,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send password reset email: ${emailError.message}`,
        );
        return ApiResponse.error(res, {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send password reset email. Please try again.',
        });
      }

      this.logger.log(`Password reset email sent to: ${user.email}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message:
          'If an account with that email exists, a password reset link has been sent.',
        data: null,
        meta: {
          email_sent_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Password reset request failed: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Password reset request failed',
      });
    }
  }

  /**
   * Reset password using reset token
   *
   * @param resetPasswordDto - Reset token and new password
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response confirming password reset
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log('Password reset attempt');

      const user = await this.userRepository.findOne({
        where: { passwordResetToken: resetPasswordDto.token },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'passwordResetToken',
          'passwordResetExpires',
          'isActive',
        ],
      });

      if (!user) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid or expired password reset token',
        });
      }

      // Check if token is expired
      if (new Date() > user.passwordResetExpires) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Password reset token has expired. Please request a new one.',
        });
      }

      // Update password
      user.password = resetPasswordDto.newPassword;
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await this.userRepository.save(user);

      // Revoke all refresh tokens for this user (force re-login)
      await this.refreshTokenRepository.update(
        { userId: user.id, isRevoked: false },
        { isRevoked: true },
      );

      this.logger.log(`Password reset successfully for user: ${user.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message:
          'Password reset successful. Please login with your new password.',
        data: null,
        meta: {
          user_id: user.id,
          password_reset_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Password reset failed: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Password reset failed',
      });
    }
  }

  /**
   * Verify user email using verification token
   *
   * @param verifyEmailDto - Email verification token
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response confirming email verification
   */
  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log('Email verification attempt');

      const user = await this.userRepository.findOne({
        where: { emailVerificationToken: verifyEmailDto.token },
        select: [
          'id',
          'email',
          'firstName',
          'lastName',
          'emailVerificationToken',
          'emailVerificationExpires',
          'isEmailVerified',
        ],
      });

      if (!user) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid or expired verification token',
        });
      }

      // Check if already verified
      if (user.isEmailVerified) {
        return ApiResponse.success(res, {
          statusCode: HttpStatus.OK,
          message: 'Email is already verified',
          data: null,
        });
      }

      // Check if token is expired
      if (new Date() > user.emailVerificationExpires) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.BAD_REQUEST,
          message:
            'Verification token has expired. Please request a new verification email.',
        });
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await this.userRepository.save(user);

      this.logger.log(`Email verified successfully for user: ${user.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Email verified successfully',
        data: null,
        meta: {
          user_id: user.id,
          verified_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Email verification failed: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Email verification failed',
      });
    }
  }

  /**
   * Resend email verification link
   *
   * @param userId - User ID requesting new verification email
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response confirming email sent
   */
  async resendVerificationEmail(
    userId: string,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Resending verification email for user: ${userId}`);

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not found',
        });
      }

      if (user.isEmailVerified) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email is already verified',
        });
      }

      // Generate new verification token
      const verificationToken = this.generateToken();
      const verificationExpires = new Date();
      verificationExpires.setHours(verificationExpires.getHours() + 24);

      user.emailVerificationToken = verificationToken;
      user.emailVerificationExpires = verificationExpires;
      await this.userRepository.save(user);

      // Send verification email
      try {
        await this.mailService.sendEmailVerification(
          user.email,
          user.firstName,
          verificationToken,
        );
      } catch (emailError) {
        this.logger.error(
          `Failed to send verification email: ${emailError.message}`,
        );
        return ApiResponse.error(res, {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Failed to send verification email. Please try again.',
        });
      }

      this.logger.log(`Verification email sent to: ${user.email}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Verification email sent successfully',
        data: null,
        meta: {
          email_sent_at: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Resend verification email failed: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to resend verification email',
      });
    }
  }

  /**
   * Generate JWT access and refresh tokens and create session
   *
   * @param user - User entity
   * @param req - Express request object
   * @returns Promise<object> - Access and refresh tokens with session ID
   */
  private async generateTokens(
    user: User,
    req: Request,
  ): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // Generate access token (short-lived)
    const jwtExpiration =
      this.configService.get<string>('JWT_EXPIRATION') || '15m';
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: jwtExpiration as never,
    });

    // Generate refresh token (long-lived)
    const refreshTokenString = this.jwtService.sign(payload, {
      expiresIn: '7d' as never,
    });

    // Store refresh token in database
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days

    const refreshToken = this.refreshTokenRepository.create({
      token: refreshTokenString,
      userId: user.id,
      expiresAt: refreshTokenExpires,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    await this.refreshTokenRepository.save(refreshToken);

    // Create session
    const deviceInfo = this.extractDeviceInfo(req.headers['user-agent'] || '');
    const session = await this.sessionService.createSession({
      userId: user.id,
      refreshToken: refreshTokenString,
      expiresAt: refreshTokenExpires,
      deviceName: deviceInfo.deviceName,
      deviceType: deviceInfo.deviceType,
      ipAddress: req.ip || null,
      userAgent: req.headers['user-agent'] || null,
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      sessionId: session.id,
    };
  }

  /**
   * Extract device information from User-Agent string
   *
   * @param userAgent - User agent string
   * @returns DeviceInfo - Device information
   */
  private extractDeviceInfo(userAgent: string): DeviceInfo {
    let deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceName = 'Unknown Device';

    // Detect device type
    if (/mobile/i.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet';
    } else if (/windows|mac|linux/i.test(userAgent)) {
      deviceType = 'desktop';
    }

    // Detect browser
    if (/chrome/i.test(userAgent) && !/edge|edg/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/edge|edg/i.test(userAgent)) {
      browser = 'Edge';
    }

    // Detect OS
    if (/windows/i.test(userAgent)) {
      os = 'Windows';
    } else if (/mac/i.test(userAgent)) {
      os = 'macOS';
    } else if (/linux/i.test(userAgent)) {
      os = 'Linux';
    } else if (/android/i.test(userAgent)) {
      os = 'Android';
    } else if (/ios|iphone|ipad/i.test(userAgent)) {
      os = 'iOS';
    }

    // Create device name
    deviceName = `${browser} on ${os}`;

    return {
      deviceName,
      deviceType,
      browser,
      os,
    };
  }

  /**
   * Generate a secure random token
   *
   * @returns string - Random token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Clean up expired tokens from blacklist and refresh tokens
   * Should be called periodically (e.g., via cron job)
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      this.logger.log('Starting cleanup of expired tokens');

      // Delete expired blacklist tokens
      const deletedBlacklist = await this.tokenBlacklistRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      // Delete expired refresh tokens
      const deletedRefresh = await this.refreshTokenRepository.delete({
        expiresAt: LessThan(new Date()),
      });

      this.logger.log(
        `Cleanup complete. Deleted ${deletedBlacklist.affected} blacklist tokens and ${deletedRefresh.affected} refresh tokens`,
      );
    } catch (error) {
      this.logger.error(`Token cleanup failed: ${error.message}`, error.stack);
    }
  }
}
