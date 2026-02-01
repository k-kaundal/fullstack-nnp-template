import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackVisitorDto } from './dto/track-visitor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PublicRateLimit, ApiUnauthorizedResponse } from '../common/decorators';

/**
 * Controller for visitor analytics and tracking
 */
@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Track website visitor (public endpoint)
   */
  @Post('track')
  @PublicRateLimit()
  @ApiOperation({ summary: 'Track website visitor' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Visitor tracked successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message: 'Visitor tracked successfully',
        data: {
          tracked: true,
          visitorId: 'uuid',
        },
      },
    },
  })
  async trackVisitor(
    @Body() trackVisitorDto: TrackVisitorDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    return this.analyticsService.trackVisitor(trackVisitorDto, req, res);
  }

  /**
   * Get analytics dashboard data (admin only)
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get analytics dashboard data' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Analytics data fetched successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Analytics fetched successfully',
        data: {
          overview: {
            totalVisitors: 1250,
            uniqueVisitors: 850,
            todayVisitors: 45,
            weekVisitors: 320,
            monthVisitors: 1150,
            returningVisitors: 400,
            newVisitors: 850,
          },
          topCountries: [
            { country: 'United States', countryCode: 'US', count: 450 },
            { country: 'India', countryCode: 'IN', count: 320 },
          ],
          topCities: [
            { city: 'New York', country: 'United States', count: 120 },
          ],
          topPages: [
            { page: '/', count: 500 },
            { page: '/about', count: 250 },
          ],
          browserStats: [
            { browser: 'Chrome', count: 800 },
            { browser: 'Safari', count: 300 },
          ],
          osStats: [
            { os: 'Windows', count: 600 },
            { os: 'Mac OS', count: 400 },
          ],
          deviceStats: [
            { device: 'desktop', count: 800 },
            { device: 'mobile', count: 400 },
          ],
        },
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/analytics/dashboard')
  async getAnalytics(@Res() res: Response): Promise<Response> {
    return this.analyticsService.getAnalytics(res);
  }

  /**
   * Get recent visitors (admin only)
   */
  @Get('recent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiOperation({ summary: 'Get recent visitors' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Recent visitors fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/analytics/recent')
  async getRecentVisitors(
    @Query('limit') limit: string = '50',
    @Res() res: Response,
  ): Promise<Response> {
    return this.analyticsService.getRecentVisitors(parseInt(limit), res);
  }
}
