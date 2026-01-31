import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  Get,
  Delete,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import {
  RevokeSessionDto,
  RevokeOtherSessionsDto,
} from './dto/session-management.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtPayload } from './interfaces/auth.interface';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '../common/decorators';

/**
 * Controller for authentication operations
 * Handles registration, login, token management, password reset, and email verification
 * Rate limiting applied to prevent abuse
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  /**
   * Register a new user account
   * Rate limited to 5 requests per minute
   */
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and sends email verification link. Rate limited to 5 requests per minute.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message:
          'Registration successful. Please check your email to verify your account.',
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            isEmailVerified: false,
            createdAt: '2026-01-31T10:00:00.000Z',
            updatedAt: '2026-01-31T10:00:00.000Z',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        meta: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          created_at: '2026-01-31T10:00:00.000Z',
          email_verification_required: true,
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/register',
      },
    },
  })
  @ApiBadRequestResponse('/api/v1/auth/register')
  @ApiConflictResponse(
    'User with this email already exists',
    '/api/v1/auth/register',
  )
  @ApiResponseDecorator({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
    schema: {
      example: {
        status: 'error',
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/register',
      },
    },
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.register(registerDto, req, res);
  }

  /**
   * Login with email and password
   * Rate limited to 10 requests per minute
   */
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  @ApiOperation({
    summary: 'Login user',
    description:
      'Authenticate user with email and password. Rate limited to 10 requests per minute.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Login successful',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Login successful',
        data: {
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            isEmailVerified: true,
            createdAt: '2026-01-31T10:00:00.000Z',
            updatedAt: '2026-01-31T10:00:00.000Z',
          },
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        meta: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          is_email_verified: true,
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/login',
      },
    },
  })
  @ApiBadRequestResponse('/api/v1/auth/login')
  @ApiUnauthorizedResponse('/api/v1/auth/login')
  @ApiResponseDecorator({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
    schema: {
      example: {
        status: 'error',
        statusCode: 429,
        message: 'ThrottlerException: Too Many Requests',
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/login',
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.login(loginDto, req, res);
  }

  /**
   * Logout user (blacklist token)
   * Requires authentication
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Blacklists the current access token and revokes all refresh tokens',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Logout successful',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Logout successful',
        data: null,
        meta: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          logged_out_at: '2026-01-31T10:00:00.000Z',
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/logout',
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/auth/logout')
  async logout(
    @Req() req: Request,
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<Response> {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.authService.logout(token, user.sub, res);
  }

  /**
   * Refresh access token using refresh token
   * Rate limited to 20 requests per minute
   */
  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Get a new access token using a valid refresh token. Rate limited to 20 requests per minute.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
        meta: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          refreshed_at: '2026-01-31T10:00:00.000Z',
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/refresh',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.refreshAccessToken(
      refreshTokenDto.refreshToken,
      req,
      res,
    );
  }

  /**
   * Request password reset
   * Rate limited to 3 requests per hour
   */
  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Sends password reset link to user email. Rate limited to 3 requests per hour.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Password reset email sent',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message:
          'If an account with that email exists, a password reset link has been sent.',
        data: null,
        meta: {
          email_sent_at: '2026-01-31T10:00:00.000Z',
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/forgot-password',
      },
    },
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.forgotPassword(forgotPasswordDto, res);
  }

  /**
   * Reset password using reset token
   * Rate limited to 5 requests per hour
   */
  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Reset password using token from email. Rate limited to 5 requests per hour.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Password reset successful',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message:
          'Password reset successful. Please login with your new password.',
        data: null,
        meta: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          password_reset_at: '2026-01-31T10:00:00.000Z',
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/reset-password',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired reset token',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.resetPassword(resetPasswordDto, res);
  }

  /**
   * Verify email using verification token
   * Rate limited to 5 requests per hour
   */
  @Post('verify-email')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 requests per hour
  @ApiOperation({
    summary: 'Verify email',
    description:
      'Verify user email using token from email. Rate limited to 5 requests per hour.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Email verified successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Email verified successfully',
        data: null,
        meta: {
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          verified_at: '2026-01-31T10:00:00.000Z',
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/verify-email',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or expired verification token',
  })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.verifyEmail(verifyEmailDto, res);
  }

  /**
   * Resend email verification
   * Requires authentication
   * Rate limited to 3 requests per hour
   */
  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 requests per hour
  @ApiOperation({
    summary: 'Resend email verification',
    description:
      'Sends a new email verification link. Rate limited to 3 requests per hour.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Verification email sent',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Verification email sent successfully',
        data: null,
        meta: {
          email_sent_at: '2026-01-31T10:00:00.000Z',
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/resend-verification',
      },
    },
  })
  async resendVerification(
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<Response> {
    return this.authService.resendVerificationEmail(user.sub, res);
  }

  /**
   * Get current user profile
   * Requires authentication
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
    description: 'Returns the authenticated user profile',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'User profile retrieved',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'User profile retrieved successfully',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'john.doe@example.com',
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/me',
      },
    },
  })
  async getCurrentUser(
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<Response> {
    return res.status(HttpStatus.OK).send({
      status: 'success',
      statusCode: HttpStatus.OK,
      message: 'User profile retrieved successfully',
      data: user,
      timestamp: new Date().toISOString(),
      path: '/api/v1/auth/me',
    });
  }

  /**
   * Get all active sessions for current user
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'List of active sessions retrieved successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Sessions retrieved successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            deviceName: 'Chrome on macOS',
            deviceType: 'desktop',
            ipAddress: '192.168.1.1',
            lastActivityAt: '2026-01-31T10:00:00.000Z',
            createdAt: '2026-01-31T09:00:00.000Z',
            expiresAt: '2026-02-07T09:00:00.000Z',
            isCurrent: true,
          },
        ],
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/sessions',
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/auth/sessions')
  async getSessions(
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<Response> {
    const sessions = await this.sessionService.getUserSessions(user.sub);

    const sessionData = sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      deviceType: session.deviceType,
      ipAddress: session.ipAddress,
      lastActivityAt: session.lastActivityAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));

    return res.status(HttpStatus.OK).send({
      status: 'success',
      statusCode: HttpStatus.OK,
      message: 'Sessions retrieved successfully',
      data: sessionData,
      meta: {
        total_sessions: sessionData.length,
      },
      timestamp: new Date().toISOString(),
      path: '/api/v1/auth/sessions',
    });
  }

  /**
   * Revoke a specific session
   */
  @Delete('sessions/revoke')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Session revoked successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Session revoked successfully',
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/sessions/revoke',
      },
    },
  })
  @ApiBadRequestResponse('/api/v1/auth/sessions/revoke')
  @ApiUnauthorizedResponse('/api/v1/auth/sessions/revoke')
  async revokeSession(
    @Body() revokeSessionDto: RevokeSessionDto,
    @Res() res: Response,
  ): Promise<Response> {
    const revoked = await this.sessionService.invalidateSession(
      revokeSessionDto.sessionId,
    );

    if (!revoked) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        status: 'error',
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Session not found or already revoked',
        timestamp: new Date().toISOString(),
        path: '/api/v1/auth/sessions/revoke',
      });
    }

    return res.status(HttpStatus.OK).send({
      status: 'success',
      statusCode: HttpStatus.OK,
      message: 'Session revoked successfully',
      timestamp: new Date().toISOString(),
      path: '/api/v1/auth/sessions/revoke',
    });
  }

  /**
   * Revoke all other sessions except current one
   */
  @Delete('sessions/revoke-others')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all other sessions' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Other sessions revoked successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'All other sessions revoked successfully',
        data: {
          revoked_count: 3,
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/sessions/revoke-others',
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/auth/sessions/revoke-others')
  async revokeOtherSessions(
    @CurrentUser() user: JwtPayload,
    @Body() revokeOtherSessionsDto: RevokeOtherSessionsDto,
    @Res() res: Response,
  ): Promise<Response> {
    const revokedCount = await this.sessionService.invalidateOtherSessions(
      user.sub,
      revokeOtherSessionsDto.currentSessionId || '',
    );

    return res.status(HttpStatus.OK).send({
      status: 'success',
      statusCode: HttpStatus.OK,
      message: 'All other sessions revoked successfully',
      data: {
        revoked_count: revokedCount,
      },
      timestamp: new Date().toISOString(),
      path: '/api/v1/auth/sessions/revoke-others',
    });
  }

  /**
   * Force logout from all devices
   */
  @Delete('sessions/logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Logged out from all devices successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Logged out from all devices successfully',
        data: {
          revoked_count: 5,
        },
        timestamp: '2026-01-31T10:00:00.000Z',
        path: '/api/v1/auth/sessions/logout-all',
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/auth/sessions/logout-all')
  async logoutAllDevices(
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<Response> {
    const revokedCount = await this.sessionService.invalidateAllUserSessions(
      user.sub,
    );

    return res.status(HttpStatus.OK).send({
      status: 'success',
      statusCode: HttpStatus.OK,
      message: 'Logged out from all devices successfully',
      data: {
        revoked_count: revokedCount,
      },
      timestamp: new Date().toISOString(),
      path: '/api/v1/auth/sessions/logout-all',
    });
  }
}
