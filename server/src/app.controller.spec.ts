import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let mockResponse: Partial<Response>;

  beforeEach(async () => {
    // Mock Response object
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      req: { url: '/' } as any,
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API health status with running message', () => {
      appController.getHello(mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          statusCode: HttpStatus.OK,
          message: 'API is running successfully',
          data: expect.objectContaining({
            message: 'Fullstack NNP API is running!',
            version: '1.0.0',
            status: 'healthy',
            timestamp: expect.any(String),
            endpoints: expect.objectContaining({
              docs: '/api/docs',
              v1: '/api/v1',
              v2: '/api/v2',
            }),
          }),
          meta: expect.objectContaining({
            environment: expect.any(String),
            uptime: expect.any(Number),
          }),
        }),
      );
    });
  });
});
