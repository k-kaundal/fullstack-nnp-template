import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto';

/**
 * Test suite for NewsletterController
 */
describe('NewsletterController', () => {
  let controller: NewsletterController;
  let service: NewsletterService;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [
        {
          provide: NewsletterService,
          useValue: {
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            findAll: jest.fn(),
            getStatistics: jest.fn(),
            sendNewsletter: jest.fn(),
            remove: jest.fn(),
            bulkDelete: jest.fn(),
            bulkUpdateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NewsletterController>(NewsletterController);
    service = module.get<NewsletterService>(NewsletterService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('subscribe', () => {
    it('should call service.subscribe with correct parameters', async () => {
      const dto: SubscribeNewsletterDto = {
        email: 'test@example.com',
      } as SubscribeNewsletterDto;

      await controller.subscribe(dto, mockResponse as Response);

      expect(service.subscribe).toHaveBeenCalledWith(dto, mockResponse);
    });
  });

  describe('getStatistics', () => {
    it('should call service.getStatistics', async () => {
      await controller.getStatistics(mockResponse as Response);

      expect(service.getStatistics).toHaveBeenCalledWith(mockResponse);
    });
  });
});
