import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Test suite for UsersController
 * Tests controller routing and delegation to service layer
 */
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object with chainable methods
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/users' } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'RBAC_ENABLED') return true;
              return null;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'SecurePass123!',
      };

      await controller.create(createUserDto, mockResponse as Response);

      expect(service.create).toHaveBeenCalledWith(createUserDto, mockResponse);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with pagination parameters', async () => {
      await controller.findAll('1', '10', mockResponse as Response);

      expect(service.findAll).toHaveBeenCalledWith(1, 10, mockResponse);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and response object', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      await controller.findOne(id, mockResponse as Response);

      expect(service.findOne).toHaveBeenCalledWith(id, mockResponse);
    });
  });

  describe('update', () => {
    it('should call service.update with correct parameters', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        firstName: 'Jane',
        isActive: false,
      };

      await controller.update(id, updateUserDto, mockResponse as Response);

      expect(service.update).toHaveBeenCalledWith(
        id,
        updateUserDto,
        mockResponse,
      );
    });
  });

  describe('remove', () => {
    it('should call service.remove with id and response object', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      await controller.remove(id, mockResponse as Response);

      expect(service.remove).toHaveBeenCalledWith(id, mockResponse);
    });
  });
});
