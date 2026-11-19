import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto';

/**
 * Test suite for RolesService
 */
describe('RolesService', () => {
  let service: RolesService;
  let roleRepository: Repository<Role>;
  let mockResponse: Partial<Response>;

  const mockRole: Partial<Role> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'admin',
    description: 'Administrator role',
    isSystemRole: true,
    permissions: [],
  };

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Permission),
          useValue: {
            findByIds: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should return 409 if role already exists', async () => {
      const dto: CreateRoleDto = { name: 'admin' } as CreateRoleDto;

      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(mockRole as Role);

      await service.create(dto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    });

    it('should create a role successfully', async () => {
      const dto: CreateRoleDto = {
        name: 'editor',
        description: 'Editor role',
      } as CreateRoleDto;

      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(roleRepository, 'create').mockReturnValue(mockRole as Role);
      jest.spyOn(roleRepository, 'save').mockResolvedValue(mockRole as Role);

      await service.create(dto, mockResponse as Response);

      expect(roleRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return 404 if role not found', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await service.findOne('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('remove', () => {
    it('should return 404 if role not found', async () => {
      jest.spyOn(roleRepository, 'findOne').mockResolvedValue(null);

      await service.remove('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
