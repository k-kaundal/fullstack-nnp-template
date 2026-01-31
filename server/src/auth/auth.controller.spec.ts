import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtPayload } from './interfaces/auth.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/auth' } as Request,
    };

    // Mock Request object
    mockRequest = {
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-test',
        authorization: 'Bearer mock-token',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            refreshAccessToken: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            verifyEmail: jest.fn(),
            resendVerificationEmail: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            getUserSessions: jest.fn(),
            invalidateSession: jest.fn(),
            invalidateOtherSessions: jest.fn(),
            invalidateAllUserSessions: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call service.register with correct parameters', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      };

      await controller.register(
        registerDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(service.register).toHaveBeenCalledWith(
        registerDto,
        mockRequest,
        mockResponse,
      );
    });
  });

  describe('login', () => {
    it('should call service.login with correct parameters', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      await controller.login(
        loginDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(service.login).toHaveBeenCalledWith(
        loginDto,
        mockRequest,
        mockResponse,
      );
    });
  });

  describe('logout', () => {
    it('should call service.logout with correct parameters', async () => {
      const user: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      mockRequest.headers = { authorization: 'Bearer mock-token' };

      await controller.logout(
        mockRequest as Request,
        user,
        mockResponse as Response,
      );

      expect(service.logout).toHaveBeenCalledWith(
        'mock-token',
        user.sub,
        mockResponse,
      );
    });
  });

  describe('refreshToken', () => {
    it('should call service.refreshAccessToken with correct parameters', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'mock-refresh-token',
      };

      await controller.refreshToken(
        refreshTokenDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(service.refreshAccessToken).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        mockRequest,
        mockResponse,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should call service.forgotPassword with correct parameters', async () => {
      const forgotPasswordDto: ForgotPasswordDto = {
        email: 'test@example.com',
      };

      await controller.forgotPassword(
        forgotPasswordDto,
        mockResponse as Response,
      );

      expect(service.forgotPassword).toHaveBeenCalledWith(
        forgotPasswordDto,
        mockResponse,
      );
    });
  });

  describe('resetPassword', () => {
    it('should call service.resetPassword with correct parameters', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        token: 'reset-token',
        newPassword: 'NewSecurePass123!',
      };

      await controller.resetPassword(
        resetPasswordDto,
        mockResponse as Response,
      );

      expect(service.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto,
        mockResponse,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should call service.verifyEmail with correct parameters', async () => {
      const verifyEmailDto: VerifyEmailDto = {
        token: 'verification-token',
      };

      await controller.verifyEmail(verifyEmailDto, mockResponse as Response);

      expect(service.verifyEmail).toHaveBeenCalledWith(
        verifyEmailDto,
        mockResponse,
      );
    });
  });

  describe('resendVerification', () => {
    it('should call service.resendVerificationEmail with correct parameters', async () => {
      const user: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      await controller.resendVerification(user, mockResponse as Response);

      expect(service.resendVerificationEmail).toHaveBeenCalledWith(
        user.sub,
        mockResponse,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const user: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
      };

      await controller.getCurrentUser(user, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.OK,
          message: 'User profile retrieved successfully',
          data: user,
        }),
      );
    });
  });
});
