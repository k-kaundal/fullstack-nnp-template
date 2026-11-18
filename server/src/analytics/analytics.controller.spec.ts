import { Test, TestingModule } from '@nestjs/testing';
import { Response, Request } from 'express';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { TrackVisitorDto } from './dto/track-visitor.dto';

/**
 * Test suite for AnalyticsController
 */
describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;
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
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            trackVisitor: jest.fn(),
            getAnalytics: jest.fn(),
            getRecentVisitors: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('trackVisitor', () => {
    it('should call service.trackVisitor with correct parameters', async () => {
      const dto: TrackVisitorDto = { page: '/home' } as TrackVisitorDto;

      await controller.trackVisitor(
        dto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(service.trackVisitor).toHaveBeenCalledWith(
        dto,
        mockRequest,
        mockResponse,
      );
    });
  });

  describe('getAnalytics', () => {
    it('should call service.getAnalytics', async () => {
      await controller.getAnalytics(mockResponse as Response);

      expect(service.getAnalytics).toHaveBeenCalledWith(mockResponse);
    });
  });
});
