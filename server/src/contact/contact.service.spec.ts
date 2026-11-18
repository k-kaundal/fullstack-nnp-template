import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { LoggerService } from '../common/logger/logger.service';
import { MailService } from '../mail/mail.service';

/**
 * Test suite for ContactService
 */
describe('ContactService', () => {
  let service: ContactService;
  let repository: Repository<Contact>;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  const mockContact: Contact = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    subject: 'Test Subject',
    message: 'Test message',
    status: 'new',
    ipAddress: '127.0.0.1',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Contact;

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      req: { url: '/contact' } as unknown as Request,
    };

    mockRequest = {
      ip: '127.0.0.1',
      headers: { 'user-agent': 'jest-test' },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: getRepositoryToken(Contact),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[mockContact], 1]),
              getCount: jest.fn().mockResolvedValue(1),
            })),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            setContext: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('admin@example.com'),
          },
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    repository = module.get<Repository<Contact>>(getRepositoryToken(Contact));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact submission successfully', async () => {
      const createContactDto: CreateContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message',
      } as CreateContactDto;

      jest.spyOn(repository, 'create').mockReturnValue(mockContact);
      jest.spyOn(repository, 'save').mockResolvedValue(mockContact);

      await service.create(
        createContactDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(repository.create).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('should handle database errors during creation', async () => {
      const createContactDto: CreateContactDto = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test',
      } as CreateContactDto;

      jest.spyOn(repository, 'create').mockReturnValue(mockContact);
      jest
        .spyOn(repository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await service.create(
        createContactDto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });
  });

  describe('findOne', () => {
    it('should return a contact by id and mark as read', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContact);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockContact,
        status: 'read',
      } as Contact);

      await service.findOne(mockContact.id, mockResponse as Response);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockContact.id },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return 404 if contact not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.findOne('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('update', () => {
    it('should update contact status successfully', async () => {
      const updateContactDto: UpdateContactDto = {
        status: 'replied',
      } as UpdateContactDto;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContact);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockContact,
        status: 'replied',
      } as Contact);

      await service.update(
        mockContact.id,
        updateContactDto,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return 404 if contact not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.update(
        'invalid-id',
        { status: 'replied' } as UpdateContactDto,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });

  describe('remove', () => {
    it('should delete contact successfully', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockContact);
      jest.spyOn(repository, 'remove').mockResolvedValue(mockContact);

      await service.remove(mockContact.id, mockResponse as Response);

      expect(repository.remove).toHaveBeenCalledWith(mockContact);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return 404 if contact not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.remove('invalid-id', mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
