import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MailService } from '../mail/mail.service';

/**
 * Test suite for UsersService
 * Tests all CRUD operations, caching, and response handling
 */
describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;
  let cacheManager: Cache;
  let mailService: MailService;
  let mockResponse: Partial<Response>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: '$2b$10$hashedPassword',
    isActive: true,
    isEmailVerified: false,
    emailVerificationToken: '',
    emailVerificationExpires: undefined,
    passwordResetToken: '',
    passwordResetExpires: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPasswordBeforeInsert: async () => {},
    hashPasswordBeforeUpdate: async () => {},
    comparePassword: async () => true,
  };

  beforeEach(async () => {
    // Mock Response object with chainable methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendWelcomeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue(mockUser);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);
      jest.spyOn(mailService, 'sendWelcomeEmail').mockResolvedValue();

      await service.create(createUserDto, mockResponse as Response);

      expect(cacheManager.del).toHaveBeenCalledWith('user_list');
      expect(mailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        mockUser.email,
        expect.any(String), // temporary password
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.CREATED,
          data: mockUser,
          message:
            'User created successfully. Welcome email sent with temporary password.',
          meta: expect.objectContaining({
            user_id: expect.any(String),
            created_at: expect.any(Date),
            email_sent: true,
          }),
        }),
      );
    });

    it('should return error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      await service.create(createUserDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: HttpStatus.CONFLICT,
          message: expect.stringContaining('already exists'),
        }),
      );
    });

    it('should handle database errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      };

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await service.create(createUserDto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Database error'),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users successfully with pagination', async () => {
      const users = [mockUser];
      jest.spyOn(repository, 'findAndCount').mockResolvedValue([users, 1]);

      await service.findAll(1, 10, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.OK,
          data: users,
          message: 'Users fetched successfully',
          meta: expect.objectContaining({
            total: 1,
            count: 1,
            page: 1,
            limit: 10,
            total_pages: 1,
            has_next: false,
            has_previous: false,
          }),
        }),
      );
    });

    it('should handle database errors', async () => {
      jest
        .spyOn(repository, 'findAndCount')
        .mockRejectedValue(new Error('Database error'));

      await service.findAll(1, 10, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('findOne', () => {
    it('should return user by ID successfully', async () => {
      // Mock cache miss scenario
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      await service.findOne(mockUser.id, mockResponse as Response);

      expect(cacheManager.get).toHaveBeenCalledWith(`user_${mockUser.id}`);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `user_${mockUser.id}`,
        mockUser,
        60000,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.OK,
          data: mockUser,
        }),
      );
    });

    it('should return cached user if available', async () => {
      // Mock cache hit scenario
      jest.spyOn(cacheManager, 'get').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.findOne(mockUser.id, mockResponse as Response);

      expect(cacheManager.get).toHaveBeenCalledWith(`user_${mockUser.id}`);
      expect(repository.findOne).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          data: mockUser,
        }),
      );
    });

    it('should return error if user not found', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.findOne('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: expect.stringContaining('not found'),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedUser as any);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      await service.update(
        mockUser.id,
        updateUserDto,
        mockResponse as Response,
      );

      expect(cacheManager.del).toHaveBeenCalledWith(`user_${mockUser.id}`);
      expect(cacheManager.del).toHaveBeenCalledWith('user_list');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.OK,
          data: updatedUser,
        }),
      );
    });

    it('should return error if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.update(
        'invalid-id',
        { firstName: 'Jane' },
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should return error if email already exists', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const existingUser = {
        ...mockUser,
        id: 'different-id',
        email: 'existing@example.com',
      };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser as any);

      await service.update(
        mockUser.id,
        updateUserDto,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: HttpStatus.CONFLICT,
          message: expect.stringContaining('already exists'),
        }),
      );
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockUser);
      jest.spyOn(cacheManager, 'del').mockResolvedValue(undefined);

      await service.remove(mockUser.id, mockResponse as Response);

      expect(cacheManager.del).toHaveBeenCalledWith(`user_${mockUser.id}`);
      expect(cacheManager.del).toHaveBeenCalledWith('user_list');
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.OK,
          data: null,
          message: 'User deleted successfully',
        }),
      );
    });

    it('should return error if user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.remove('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          statusCode: HttpStatus.NOT_FOUND,
          message: expect.stringContaining('not found'),
        }),
      );
    });
  });
});
