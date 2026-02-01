import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response, Request } from 'express';
import { Contact } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ApiResponse } from '../common/utils/api-response.util';
import { LoggerService } from '../common/logger/logger.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

/**
 * Service for managing contact form submissions
 */
@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly logger: LoggerService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Create a new contact submission
   * Sends email notification to admin
   */
  async create(
    createContactDto: CreateContactDto,
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(
        `New contact submission from ${createContactDto.email}`,
        'ContactService',
      );

      // Get IP address
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';

      // Create contact record
      const contact = this.contactRepository.create({
        ...createContactDto,
        ipAddress: ipAddress as string,
      });

      const savedContact = await this.contactRepository.save(contact);

      // Send email notification to admin
      try {
        const adminEmail =
          this.configService.get<string>('ADMIN_EMAIL') ||
          this.configService.get<string>('MAIL_FROM');

        if (adminEmail) {
          await this.mailService.sendEmail({
            to: adminEmail,
            subject: `New Contact Form Submission: ${createContactDto.subject}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #2563eb; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
                </div>
                <div style="padding: 30px; background: #f9fafb;">
                  <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #1f2937; margin-top: 0;">Contact Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-weight: bold; width: 120px;">Name:</td>
                        <td style="padding: 10px 0; color: #1f2937;">${createContactDto.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Email:</td>
                        <td style="padding: 10px 0; color: #1f2937;">${createContactDto.email}</td>
                      </tr>
                      ${
                        createContactDto.phone
                          ? `
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Phone:</td>
                        <td style="padding: 10px 0; color: #1f2937;">${createContactDto.phone}</td>
                      </tr>
                      `
                          : ''
                      }
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">Subject:</td>
                        <td style="padding: 10px 0; color: #1f2937;">${createContactDto.subject}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #6b7280; font-weight: bold;">IP Address:</td>
                        <td style="padding: 10px 0; color: #1f2937;">${ipAddress}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="background: white; padding: 20px; border-radius: 8px;">
                    <h3 style="color: #1f2937; margin-top: 0;">Message:</h3>
                    <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${createContactDto.message}</p>
                  </div>

                  <div style="margin-top: 20px; text-align: center;">
                    <p style="color: #6b7280; font-size: 14px;">
                      View all contact submissions in your admin dashboard
                    </p>
                  </div>
                </div>
              </div>
            `,
          });

          this.logger.log(
            `Admin notification email sent for contact #${savedContact.id}`,
            'ContactService',
          );
        }
      } catch (emailError) {
        this.logger.error(
          `Failed to send admin notification email: ${emailError.message}`,
          emailError.stack,
          'ContactService',
        );
        // Don't fail the request if email fails
      }

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedContact,
        message: 'Thank you for contacting us! We will get back to you soon.',
        meta: {
          contact_id: savedContact.id,
          created_at: savedContact.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create contact submission: ${error.message}`,
        error.stack,
        'ContactService',
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to submit contact form',
      });
    }
  }

  /**
   * Get all contact submissions with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 20,
    status?: string,
    res?: Response,
  ): Promise<Response> {
    try {
      const skip = (page - 1) * limit;
      const queryBuilder = this.contactRepository.createQueryBuilder('contact');

      if (status && status !== 'all') {
        queryBuilder.where('contact.status = :status', { status });
      }

      const [contacts, total] = await queryBuilder
        .orderBy('contact.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: contacts,
        message: 'Contact submissions fetched successfully',
        meta: {
          total,
          count: contacts.length,
          page,
          limit,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch contact submissions: ${error.message}`,
        error.stack,
        'ContactService',
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch contact submissions',
      });
    }
  }

  /**
   * Get contact statistics
   */
  async getStatistics(res: Response): Promise<Response> {
    try {
      const [total, newContacts, readContacts, repliedContacts] =
        await Promise.all([
          this.contactRepository.count(),
          this.contactRepository.count({ where: { status: 'new' } }),
          this.contactRepository.count({ where: { status: 'read' } }),
          this.contactRepository.count({ where: { status: 'replied' } }),
        ]);

      // Today's contacts
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayContacts = await this.contactRepository
        .createQueryBuilder('contact')
        .where('contact.createdAt >= :today', { today })
        .getCount();

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: {
          total,
          new: newContacts,
          read: readContacts,
          replied: repliedContacts,
          today: todayContacts,
        },
        message: 'Contact statistics fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch contact statistics: ${error.message}`,
        error.stack,
        'ContactService',
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch contact statistics',
      });
    }
  }

  /**
   * Get single contact by ID
   */
  async findOne(id: string, res: Response): Promise<Response> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
      });

      if (!contact) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Contact submission not found',
        });
      }

      // Auto-mark as read if it was new
      if (contact.status === 'new') {
        contact.status = 'read';
        await this.contactRepository.save(contact);
      }

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: contact,
        message: 'Contact submission fetched successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch contact submission: ${error.message}`,
        error.stack,
        'ContactService',
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to fetch contact submission',
      });
    }
  }

  /**
   * Update contact status
   */
  async update(
    id: string,
    updateContactDto: UpdateContactDto,
    res: Response,
  ): Promise<Response> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
      });

      if (!contact) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Contact submission not found',
        });
      }

      Object.assign(contact, updateContactDto);
      const updated = await this.contactRepository.save(contact);

      this.logger.log(
        `Contact #${id} status updated to ${updated.status}`,
        'ContactService',
      );

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: updated,
        message: 'Contact status updated successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to update contact: ${error.message}`,
        error.stack,
        'ContactService',
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to update contact status',
      });
    }
  }

  /**
   * Delete contact submission
   */
  async remove(id: string, res: Response): Promise<Response> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
      });

      if (!contact) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Contact submission not found',
        });
      }

      await this.contactRepository.remove(contact);

      this.logger.log(`Contact #${id} deleted`, 'ContactService');

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: null,
        message: 'Contact submission deleted successfully',
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete contact: ${error.message}`,
        error.stack,
        'ContactService',
      );

      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to delete contact submission',
      });
    }
  }
}
