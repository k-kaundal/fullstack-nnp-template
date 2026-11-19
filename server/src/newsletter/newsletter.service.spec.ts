import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { HttpStatus } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { NewsletterSubscriber } from './entities/newsletter.entity';
import { SubscribeNewsletterDto } from './dto';
import { MailService } from '../mail/mail.service';

/**
 * Test suite for NewsletterService
 */
describe('NewsletterService', () => {
  let service: NewsletterService;
  let repository: Repository<NewsletterSubscriber>;
  let mockResponse: Partial<Response>;

  const mockSubscriber: Partial<NewsletterSubscriber> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'subscriber@example.com',
    firstName: 'John',
    isActive: true,
    subscribedAt: new Date(),
  };

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        {
          provide: getRepositoryToken(NewsletterSubscriber),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            findAndCount: jest.fn(),
            remove: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
    repository = module.get<Repository<NewsletterSubscriber>>(
      getRepositoryToken(NewsletterSubscriber),
    );
    module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should subscribe a new email successfully', async () => {
      const dto: SubscribeNewsletterDto = {
        email: 'new@example.com',
      } as SubscribeNewsletterDto;

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockReturnValue(mockSubscriber as NewsletterSubscriber);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(mockSubscriber as NewsletterSubscriber);

      await service.subscribe(dto, mockResponse as Response);

      expect(repository.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CREATED);
    });

    it('should reactivate an unsubscribed email', async () => {
      const dto: SubscribeNewsletterDto = {
        email: 'existing@example.com',
      } as SubscribeNewsletterDto;

      const inactiveSubscriber = {
        ...mockSubscriber,
        isActive: false,
        unsubscribedAt: new Date(),
      } as NewsletterSubscriber;

      jest.spyOn(repository, 'findOne').mockResolvedValue(inactiveSubscriber);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...inactiveSubscriber,
        isActive: true,
      } as NewsletterSubscriber);

      await service.subscribe(dto, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe an active subscriber', async () => {
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockSubscriber as NewsletterSubscriber);
      jest.spyOn(repository, 'save').mockResolvedValue({
        ...mockSubscriber,
        isActive: false,
      } as NewsletterSubscriber);

      await service.unsubscribe(
        'subscriber@example.com',
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return 404 if email not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await service.unsubscribe(
        'nonexistent@example.com',
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });
  });
});
