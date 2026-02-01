/**
 * Newsletter Service
 * Handles newsletter subscription management and sending
 */

import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { NewsletterSubscriber } from './entities/newsletter.entity';
import { SubscribeNewsletterDto, SendNewsletterDto } from './dto';
import { ApiResponse } from '../common/utils/api-response.util';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly newsletterRepository: Repository<NewsletterSubscriber>,
    private readonly mailService: MailService,
  ) {}

  /**
   * Subscribe to newsletter
   * @param dto - Subscription data
   * @param res - Express response object
   */
  async subscribe(
    dto: SubscribeNewsletterDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Newsletter subscription attempt: ${dto.email}`);

      // Check if already subscribed
      const existing = await this.newsletterRepository.findOne({
        where: { email: dto.email },
      });

      if (existing) {
        // If previously unsubscribed, reactivate
        if (!existing.isActive) {
          existing.isActive = true;
          existing.unsubscribedAt = null;
          existing.firstName = dto.firstName || existing.firstName;
          existing.lastName = dto.lastName || existing.lastName;
          await this.newsletterRepository.save(existing);

          this.logger.log(`Newsletter reactivated: ${dto.email}`);

          return ApiResponse.success(res, {
            statusCode: HttpStatus.OK,
            data: existing,
            message: 'Successfully resubscribed to newsletter',
            meta: {
              subscriber_id: existing.id,
              resubscribed: true,
            },
          });
        }

        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'Email already subscribed to newsletter',
        });
      }

      // Create new subscriber
      const subscriber = this.newsletterRepository.create(dto);
      const saved = await this.newsletterRepository.save(subscriber);

      // Send welcome email
      try {
        await this.mailService.sendEmail({
          to: saved.email,
          subject: 'Welcome to Our Newsletter!',
          text: `Thank you for subscribing to our newsletter!`,
          html: `
            <h1>Welcome!</h1>
            <p>Thank you for subscribing to our newsletter. You'll receive updates about our latest news and features.</p>
            <p>If you wish to unsubscribe, you can do so at any time.</p>
          `,
        });
      } catch (emailError) {
        this.logger.warn(`Failed to send welcome email: ${emailError.message}`);
      }

      this.logger.log(`Newsletter subscriber created: ${saved.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: saved,
        message: 'Successfully subscribed to newsletter',
        meta: {
          subscriber_id: saved.id,
          subscribed_at: saved.subscribedAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to subscribe to newsletter: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to subscribe to newsletter',
      });
    }
  }

  /**
   * Unsubscribe from newsletter
   * @param email - Email to unsubscribe
   * @param res - Express response object
   */
  async unsubscribe(email: string, res: Response): Promise<Response> {
    try {
      this.logger.log(`Newsletter unsubscribe attempt: ${email}`);

      const subscriber = await this.newsletterRepository.findOne({
        where: { email },
      });

      if (!subscriber) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Email not found in newsletter subscribers',
        });
      }

      if (!subscriber.isActive) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Email already unsubscribed',
        });
      }

      subscriber.isActive = false;
      subscriber.unsubscribedAt = new Date();
      await this.newsletterRepository.save(subscriber);

      this.logger.log(`Newsletter unsubscribed: ${email}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Successfully unsubscribed from newsletter',
        meta: {
          unsubscribed_at: subscriber.unsubscribedAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to unsubscribe: ${error.message}`, error.stack);

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to unsubscribe from newsletter',
      });
    }
  }

  /**
   * Get all subscribers with pagination
   * @param page - Page number
   * @param limit - Items per page
   * @param res - Express response object
   */
  async findAll(
    page: number = 1,
    limit: number = 50,
    res: Response,
  ): Promise<Response> {
    try {
      const skip = (page - 1) * limit;

      const [subscribers, total] = await this.newsletterRepository.findAndCount(
        {
          skip,
          take: limit,
          order: { subscribedAt: 'DESC' },
        },
      );

      const totalPages = Math.ceil(total / limit);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: subscribers,
        message: 'Newsletter subscribers fetched successfully',
        meta: {
          total,
          count: subscribers.length,
          page,
          limit,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch subscribers: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch newsletter subscribers',
      });
    }
  }

  /**
   * Get newsletter statistics
   * @param res - Express response object
   */
  async getStatistics(res: Response): Promise<Response> {
    try {
      const total = await this.newsletterRepository.count();
      const active = await this.newsletterRepository.count({
        where: { isActive: true },
      });
      const inactive = await this.newsletterRepository.count({
        where: { isActive: false },
      });

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todaySubscribed = await this.newsletterRepository.count({
        where: {
          subscribedAt: todayStart,
        },
      });

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: {
          total,
          active,
          inactive,
          todaySubscribed,
        },
        message: 'Newsletter statistics fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch statistics: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch newsletter statistics',
      });
    }
  }

  /**
   * Send newsletter to all active subscribers
   * @param dto - Newsletter content
   * @param res - Express response object
   */
  async sendNewsletter(
    dto: SendNewsletterDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Sending newsletter: ${dto.subject}`);

      const activeSubscribers = await this.newsletterRepository.find({
        where: { isActive: true },
      });

      if (activeSubscribers.length === 0) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'No active subscribers to send newsletter',
        });
      }

      const results = {
        sent: 0,
        failed: 0,
      };

      // Send to all active subscribers
      for (const subscriber of activeSubscribers) {
        try {
          await this.mailService.sendEmail({
            to: subscriber.email,
            subject: dto.subject,
            html: dto.content,
          });
          results.sent++;
        } catch (emailError) {
          this.logger.error(
            `Failed to send to ${subscriber.email}: ${emailError.message}`,
          );
          results.failed++;
        }
      }

      this.logger.log(
        `Newsletter sent: ${results.sent} successful, ${results.failed} failed`,
      );

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Newsletter sent successfully',
        meta: {
          total_subscribers: activeSubscribers.length,
          sent: results.sent,
          failed: results.failed,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send newsletter: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to send newsletter',
      });
    }
  }

  /**
   * Delete subscriber
   * @param id - Subscriber ID
   * @param res - Express response object
   */
  async remove(id: string, res: Response): Promise<Response> {
    try {
      const subscriber = await this.newsletterRepository.findOne({
        where: { id },
      });

      if (!subscriber) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Subscriber not found',
        });
      }

      await this.newsletterRepository.remove(subscriber);

      this.logger.log(`Newsletter subscriber deleted: ${id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        message: 'Subscriber deleted successfully',
        meta: {
          deleted_id: id,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete subscriber: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to delete subscriber',
      });
    }
  }
}
