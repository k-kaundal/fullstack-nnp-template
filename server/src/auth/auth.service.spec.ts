import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TokenBlacklist } from './entities/token-blacklist.entity';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let tokenBlacklistRepository: Repository<TokenBlacklist>;
  let jwtService: JwtService;
  let mailService: MailService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword123',
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    comparePassword: jest.fn(),
  };

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/auth/register' } as Request,
    };

    // Mock Request object
    mockRequest = {
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-test',
        authorization: 'Bearer token123',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TokenBlacklist),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRATION: '15m',
              };
              return config[key];
            }),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmailVerification: jest.fn(),
            sendPasswordReset: jest.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            createSession: jest.fn().mockResolvedValue({ id: 'session-123' }),
            getUserSessions: jest.fn(),
            invalidateSession: jest.fn(),
            invalidateAllUserSessions: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    refreshTokenRepository = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    tokenBlacklistRepository = module.get<Repository<TokenBlacklist>>(
      getRepositoryToken(TokenBlacklist),
    );
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userRepository, 'create')
        .mockReturnValue(mockUser as unknown as User);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(mockUser as unknown as User);
      jest
        .spyOn(refreshTokenRepository, 'create')
        .mockReturnValue({} as RefreshToken);
      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockResolvedValue({} as RefreshToken);

      await service.register(
        registerDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: expect.objectContaining({
            user: expect.not.objectContaining({ password: expect.anything() }),
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          }),
        }),
      );
    });

    it('should return error if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as unknown as User);

      await service.register(
        registerDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'User with this email already exists',
        }),
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const mockUserWithPassword = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUserWithPassword as unknown as User);
      jest
        .spyOn(refreshTokenRepository, 'create')
        .mockReturnValue({} as RefreshToken);
      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockResolvedValue({} as RefreshToken);

      await service.login(
        loginDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Login successful',
          data: expect.objectContaining({
            user: expect.not.objectContaining({ password: expect.anything() }),
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          }),
        }),
      );
    });

    it('should return error for invalid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await service.login(
        loginDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid email or password',
        }),
      );
    });

    it('should return error for inactive user', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const inactiveUser = {
        ...mockUser,
        isActive: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(inactiveUser as unknown as User);

      await service.login(
        loginDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('deactivated'),
        }),
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const token = 'mock-jwt-token';
      const userId = mockUser.id;

      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: userId,
        email: mockUser.email,
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      jest
        .spyOn(tokenBlacklistRepository, 'create')
        .mockReturnValue({} as TokenBlacklist);
      jest
        .spyOn(tokenBlacklistRepository, 'save')
        .mockResolvedValue({} as TokenBlacklist);
      jest
        .spyOn(refreshTokenRepository, 'update')
        .mockResolvedValue({ affected: 1 } as never);

      await service.logout(token, userId, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Logout successful',
        }),
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      const refreshTokenString = 'mock-refresh-token';
      const mockRefreshToken = {
        id: 'token-id',
        token: refreshTokenString,
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: false,
        user: mockUser,
      };

      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockResolvedValue(mockRefreshToken as unknown as RefreshToken);
      jest
        .spyOn(refreshTokenRepository, 'save')
        .mockResolvedValue({} as RefreshToken);
      jest
        .spyOn(refreshTokenRepository, 'create')
        .mockReturnValue({} as RefreshToken);

      await service.refreshAccessToken(
        refreshTokenString,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Token refreshed successfully',
          data: expect.objectContaining({
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          }),
        }),
      );
    });

    it('should return error for invalid refresh token', async () => {
      const refreshTokenString = 'invalid-token';

      jest.spyOn(refreshTokenRepository, 'findOne').mockResolvedValue(null);

      await service.refreshAccessToken(
        refreshTokenString,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Invalid refresh token',
        }),
      );
    });

    it('should return error for revoked refresh token', async () => {
      const refreshTokenString = 'revoked-token';
      const mockRevokedToken = {
        token: refreshTokenString,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 86400000),
      };

      jest
        .spyOn(refreshTokenRepository, 'findOne')
        .mockResolvedValue(mockRevokedToken as unknown as RefreshToken);

      await service.refreshAccessToken(
        refreshTokenString,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Refresh token has been revoked',
        }),
      );
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email successfully', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as unknown as User);
      jest
        .spyOn(userRepository, 'save')
        .mockResolvedValue(mockUser as unknown as User);
      jest.spyOn(mailService, 'sendPasswordReset').mockResolvedValue();

      await service.forgotPassword(
        { email: mockUser.email },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mailService.sendPasswordReset).toHaveBeenCalled();
    });

    it('should return success even for non-existent email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await service.forgotPassword(
        { email: 'nonexistent@example.com' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: expect.stringContaining('If an account'),
        }),
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockUnverifiedUser = {
        ...mockUser,
        isEmailVerified: false,
        emailVerificationToken: 'valid-token',
        emailVerificationExpires: new Date(Date.now() + 86400000),
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUnverifiedUser as unknown as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue({
        ...mockUnverifiedUser,
        isEmailVerified: true,
      } as unknown as User);

      await service.verifyEmail(
        { token: 'valid-token' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          message: 'Email verified successfully',
        }),
      );
    });

    it('should return error for invalid token', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await service.verifyEmail(
        { token: 'invalid-token' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Invalid'),
        }),
      );
    });

    it('should return success if email already verified', async () => {
      const mockVerifiedUser = {
        ...mockUser,
        isEmailVerified: true,
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockVerifiedUser as unknown as User);

      await service.verifyEmail(
        { token: 'some-token' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Email is already verified',
        }),
      );
    });
  });
});
