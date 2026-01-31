import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequestLoggerService } from '../services/request-logger.service';
import { LogCleanupService } from '../services/log-cleanup.service';
import { ApiResponse } from '../utils/api-response.util';
import { TriggerCleanupDto } from '../dto/trigger-cleanup.dto';
import {
  ApiUnauthorizedResponse,
  ApiStandardProtectedResponses,
} from '../decorators/api-responses.decorator';

/**
 * Request Logs Controller
 * Provides endpoints for viewing request logs and statistics
 * Admin-only endpoints for managing logs
 */
@ApiTags('Request Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/request-logs')
export class RequestLogsController {
  constructor(
    private readonly requestLoggerService: RequestLoggerService,
    private readonly logCleanupService: LogCleanupService,
  ) {}

  /**
   * Get all request logs with pagination
   *
   * @param page - Page number
   * @param limit - Items per page
   * @param res - Express response
   * @returns Paginated request logs
   */
  @Get()
  @ApiOperation({ summary: 'Get all request logs' })
  @ApiUnauthorizedResponse('/admin/request-logs')
  async getRequestLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Res() res: Response,
  ): Promise<Response> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const { logs, total } = await this.requestLoggerService.getRequestLogs(
      pageNum,
      limitNum,
    );

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, {
      statusCode: HttpStatus.OK,
      data: logs,
      message: 'Request logs fetched successfully',
      meta: {
        total,
        count: logs.length,
        page: pageNum,
        limit: limitNum,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_previous: pageNum > 1,
      },
    });
  }

  /**
   * Get request logs for specific user
   *
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @param res - Express response
   * @returns User's request logs
   */
  @Get('user')
  @ApiOperation({ summary: 'Get request logs for specific user' })
  @ApiUnauthorizedResponse('/admin/request-logs/user')
  async getUserRequestLogs(
    @Query('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Res() res: Response,
  ): Promise<Response> {
    if (!userId) {
      return ApiResponse.error(res, {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'User ID is required',
      });
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;

    const { logs, total } = await this.requestLoggerService.getUserRequestLogs(
      userId,
      pageNum,
      limitNum,
    );

    const totalPages = Math.ceil(total / limitNum);

    return ApiResponse.success(res, {
      statusCode: HttpStatus.OK,
      data: logs,
      message: 'User request logs fetched successfully',
      meta: {
        user_id: userId,
        total,
        count: logs.length,
        page: pageNum,
        limit: limitNum,
        total_pages: totalPages,
        has_next: pageNum < totalPages,
        has_previous: pageNum > 1,
      },
    });
  }

  /**
   * Get request log statistics
   *
   * @param res - Express response
   * @returns Request statistics
   */
  @Get('statistics')
  @ApiOperation({ summary: 'Get request log statistics' })
  @ApiUnauthorizedResponse('/admin/request-logs/statistics')
  async getStatistics(@Res() res: Response): Promise<Response> {
    const stats = await this.requestLoggerService.getStatistics();

    return ApiResponse.success(res, {
      statusCode: HttpStatus.OK,
      data: stats,
      message: 'Request statistics fetched successfully',
    });
  }

  /**
   * Get cleanup statistics
   *
   * @param res - Express response
   * @returns Cleanup statistics
   */
  @Get('cleanup/stats')
  @ApiOperation({ summary: 'Get cleanup statistics' })
  @ApiUnauthorizedResponse('/admin/request-logs/cleanup/stats')
  async getCleanupStats(@Res() res: Response): Promise<Response> {
    const stats = await this.logCleanupService.getCleanupStats();

    return ApiResponse.success(res, {
      statusCode: HttpStatus.OK,
      data: stats,
      message: 'Cleanup statistics fetched successfully',
    });
  }

  /**
   * Trigger manual cleanup of old logs
   *
   * @param triggerCleanupDto - Cleanup configuration
   * @param res - Express response
   * @returns Cleanup result
   */
  @Post('cleanup/trigger')
  @ApiOperation({ summary: 'Manually trigger log cleanup' })
  @ApiStandardProtectedResponses('/admin/request-logs/cleanup/trigger')
  async triggerCleanup(
    @Body() triggerCleanupDto: TriggerCleanupDto,
    @Res() res: Response,
  ): Promise<Response> {
    const hours = triggerCleanupDto.hours || 24;

    const deletedCount = await this.logCleanupService.triggerCleanup(hours);

    return ApiResponse.success(res, {
      statusCode: HttpStatus.OK,
      data: { deleted_count: deletedCount },
      message: `Cleanup completed: ${deletedCount} logs deleted`,
    });
  }
}
