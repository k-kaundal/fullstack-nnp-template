import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

/**
 * Test suite for ContactController
 */
describe('ContactController', () => {
  let controller: ContactController;
  let service: ContactService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest-test' },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [
        {
          provide: ContactService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            getStatistics: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContactController>(ContactController);
    service = module.get<ContactService>(ContactService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with correct parameters', async () => {
      const dto: CreateContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
      } as CreateContactDto;

      await controller.create(
        dto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(service.create).toHaveBeenCalledWith(
        dto,
        mockRequest,
        mockResponse,
      );
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with correct parameters', async () => {
      await controller.findOne('some-id', mockResponse as Response);

      expect(service.findOne).toHaveBeenCalledWith('some-id', mockResponse);
    });
  });

  describe('update', () => {
    it('should call service.update with correct parameters', async () => {
      const dto: UpdateContactDto = { status: 'read' } as UpdateContactDto;

      await controller.update('some-id', dto, mockResponse as Response);

      expect(service.update).toHaveBeenCalledWith('some-id', dto, mockResponse);
    });
  });

  describe('remove', () => {
    it('should call service.remove with correct parameters', async () => {
      await controller.remove('some-id', mockResponse as Response);

      expect(service.remove).toHaveBeenCalledWith('some-id', mockResponse);
    });
  });
});
