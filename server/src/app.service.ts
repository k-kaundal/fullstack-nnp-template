import { Injectable, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from './common/utils/api-response.util';

/**
 * Main application service
 * Provides core application functionality including health checks
 */
@Injectable()
export class AppService {
  /**
   * Returns API health status and basic information
   *
   * @param res - Express response object
   * @returns Response - HTTP response with API health data
   */
  getHello(res: Response): Response {
    try {
      // Prepare health check data with API information
      const healthData = {
        message: 'Fullstack NNP API is running!',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
          docs: '/api/docs',
          v1: '/api/v1',
          v2: '/api/v2',
        },
      };

      // Return success response with health status and environment metadata
      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: healthData,
        message: 'API is running successfully',
        meta: {
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch (error) {
      // Return error response if health check fails
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Health check failed',
      });
    }
  }
}
