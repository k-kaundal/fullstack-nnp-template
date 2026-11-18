import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { VisitorLog } from './entities/visitor-log.entity';
import { TrackVisitorDto } from './dto/track-visitor.dto';

/**
 * Test suite for AnalyticsService
 */
describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let repository: Repository<VisitorLog>;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;

  const mockVisitorLog: Partial<VisitorLog> = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    ipAddress: '8.8.8.8',
    page: '/home',
    country: 'United States',
    browser: 'Chrome',
    visitedAt: new Date(),
  };

  beforeEach(async () => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      req: { url: '/analytics' } as unknown as Request,
    };

    mockRequest = {
      ip: '8.8.8.8',
      headers: {
        'user-agent': 'Mozilla/5.0',
        'x-forwarded-for': '8.8.8.8',
      },
      socket: { remoteAddress: '8.8.8.8' } as unknown as Request['socket'],
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getRepositoryToken(VisitorLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              addGroupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ count: '10' }),
              getRawMany: jest.fn().mockResolvedValue([]),
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    repository = module.get<Repository<VisitorLog>>(
      getRepositoryToken(VisitorLog),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackVisitor', () => {
    it('should skip tracking if IP already exists', async () => {
      const dto: TrackVisitorDto = { page: '/home' } as TrackVisitorDto;
      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValue(mockVisitorLog as VisitorLog);

      await service.trackVisitor(
        dto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle local IPs without geolocation', async () => {
      const dto: TrackVisitorDto = { page: '/home' } as TrackVisitorDto;
      mockRequest = {
        ...mockRequest,
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test' },
      };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(repository, 'create')
        .mockReturnValue(mockVisitorLog as VisitorLog);
      jest
        .spyOn(repository, 'save')
        .mockResolvedValue(mockVisitorLog as VisitorLog);

      await service.trackVisitor(
        dto,
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      jest.spyOn(repository, 'count').mockResolvedValue(100);

      await service.getAnalytics(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });

  describe('getRecentVisitors', () => {
    it('should return recent visitors with limit', async () => {
      jest
        .spyOn(repository, 'find')
        .mockResolvedValue([mockVisitorLog as VisitorLog]);

      await service.getRecentVisitors(10, mockResponse as Response);

      expect(repository.find).toHaveBeenCalledWith({
        order: { visitedAt: 'DESC' },
        take: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });
});
