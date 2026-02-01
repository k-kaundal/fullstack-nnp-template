/**
 * Newsletter Controller
 * Handles newsletter subscription and management endpoints
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto, SendNewsletterDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '../common/decorators';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  /**
   * Subscribe to newsletter (public endpoint)
   */
  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter (public)' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Successfully subscribed to newsletter',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message: 'Successfully subscribed to newsletter',
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          subscribedAt: '2026-02-01T10:00:00.000Z',
        },
        meta: {
          subscriber_id: '123e4567-e89b-12d3-a456-426614174000',
          subscribed_at: '2026-02-01T10:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse('/api/v1/newsletter/subscribe')
  @ApiConflictResponse(
    'Email already subscribed to newsletter',
    '/api/v1/newsletter/subscribe',
  )
  async subscribe(
    @Body() dto: SubscribeNewsletterDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.newsletterService.subscribe(dto, res);
  }

  /**
   * Unsubscribe from newsletter (public endpoint)
   */
  @Post('unsubscribe/:email')
  @ApiOperation({ summary: 'Unsubscribe from newsletter (public)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Successfully unsubscribed from newsletter',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Successfully unsubscribed from newsletter',
        meta: {
          unsubscribed_at: '2026-02-01T10:00:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse('Email', '/api/v1/newsletter/unsubscribe/:email')
  @ApiBadRequestResponse('/api/v1/newsletter/unsubscribe/:email')
  async unsubscribe(
    @Param('email') email: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.newsletterService.unsubscribe(email, res);
  }

  /**
   * Get all subscribers (admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all newsletter subscribers (admin)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Newsletter subscribers fetched successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Newsletter subscribers fetched successfully',
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            subscribedAt: '2026-02-01T10:00:00.000Z',
          },
        ],
        meta: {
          total: 100,
          count: 50,
          page: 1,
          limit: 50,
          total_pages: 2,
          has_next: true,
          has_previous: false,
        },
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/newsletter')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Res() res: Response,
  ): Promise<Response> {
    return this.newsletterService.findAll(parseInt(page), parseInt(limit), res);
  }

  /**
   * Get newsletter statistics (admin only)
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @SkipThrottle()
  @ApiOperation({ summary: 'Get newsletter statistics (admin)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Newsletter statistics fetched successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Newsletter statistics fetched successfully',
        data: {
          total: 1000,
          active: 850,
          inactive: 150,
          todaySubscribed: 25,
        },
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/newsletter/statistics')
  async getStatistics(@Res() res: Response): Promise<Response> {
    return this.newsletterService.getStatistics(res);
  }

  /**
   * Send newsletter to all active subscribers (admin only)
   */
  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Send newsletter to all active subscribers (admin)',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Newsletter sent successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Newsletter sent successfully',
        meta: {
          total_subscribers: 850,
          sent: 845,
          failed: 5,
        },
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/newsletter/send')
  @ApiBadRequestResponse('/api/v1/newsletter/send')
  async sendNewsletter(
    @Body() dto: SendNewsletterDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.newsletterService.sendNewsletter(dto, res);
  }

  /**
   * Delete subscriber (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete newsletter subscriber (admin)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Subscriber deleted successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Subscriber deleted successfully',
        meta: {
          deleted_id: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/newsletter/:id')
  @ApiNotFoundResponse('Subscriber', '/api/v1/newsletter/:id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.newsletterService.remove(id, res);
  }
}
