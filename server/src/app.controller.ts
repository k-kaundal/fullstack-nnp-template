import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';

/**
 * Main application controller
 * Handles root endpoint for health checks and API status
 */
@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check endpoint to verify API is running
   *
   * @param res - Express response object
   * @returns Response - HTTP response with API health status
   */
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'API is running',
  })
  getHello(@Res() res: Response): Response {
    return this.appService.getHello(res);
  }

  /**
   * Favicon endpoint to prevent 404 errors from browser requests
   * Returns 204 No Content to silently handle favicon requests
   *
   * @param res - Express response object
   * @returns Response - HTTP 204 No Content
   */
  @Get('favicon.ico')
  @ApiOperation({ summary: 'Favicon endpoint' })
  @ApiResponseDecorator({
    status: HttpStatus.NO_CONTENT,
    description: 'No favicon available',
  })
  getFavicon(@Res() res: Response): Response {
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
