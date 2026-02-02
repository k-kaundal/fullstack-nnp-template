import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Res,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '../common/decorators';

/**
 * Contact controller
 * Handles contact form submissions and admin management
 */
@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * Submit contact form (public endpoint)
   */
  @Post()
  @ApiOperation({
    summary: 'Submit contact form',
    description:
      'Public endpoint for contact form submissions. Sends email to admin.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Contact form submitted successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message: 'Thank you for contacting us! We will get back to you soon.',
        data: {
          id: 'uuid',
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'General Inquiry',
          message: 'I would like to know more...',
          status: 'new',
          createdAt: '2026-02-01T10:00:00.000Z',
        },
        meta: {
          contact_id: 'uuid',
          created_at: '2026-02-01T10:00:00.000Z',
        },
      },
    },
  })
  @ApiBadRequestResponse('/api/v1/contact')
  async create(
    @Body() createContactDto: CreateContactDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    return this.contactService.create(createContactDto, req, res);
  }

  /**
   * Get all contact submissions (admin only)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all contact submissions',
    description:
      'Admin endpoint to retrieve contact submissions with pagination and filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status',
    example: 'new',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Contact submissions fetched successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Contact submissions fetched successfully',
        data: [
          {
            id: 'uuid',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            subject: 'General Inquiry',
            message: 'I would like to know more...',
            status: 'new',
            ipAddress: '192.168.1.1',
            createdAt: '2026-02-01T10:00:00.000Z',
          },
        ],
        meta: {
          total: 50,
          count: 20,
          page: 1,
          limit: 20,
          total_pages: 3,
          has_next: true,
          has_previous: false,
        },
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/contact')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.contactService.findAll(
      parseInt(page),
      parseInt(limit),
      status,
      res,
    );
  }

  /**
   * Get contact statistics (admin only)
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get contact statistics',
    description: 'Admin endpoint to get contact submission statistics',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Statistics fetched successfully',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Contact statistics fetched successfully',
        data: {
          total: 150,
          new: 25,
          read: 50,
          replied: 60,
          today: 5,
        },
      },
    },
  })
  @ApiUnauthorizedResponse('/api/v1/contact/statistics')
  async getStatistics(@Res() res: Response): Promise<Response> {
    return this.contactService.getStatistics(res);
  }

  /**
   * Get single contact submission (admin only)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get contact submission by ID',
    description:
      'Admin endpoint to get single contact submission. Auto-marks as read.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Contact submission fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/contact/:id')
  @ApiNotFoundResponse('Contact', '/api/v1/contact/:id')
  async findOne(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.contactService.findOne(id, res);
  }

  /**
   * Update contact status (admin only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update contact status',
    description: 'Admin endpoint to update contact submission status',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Contact status updated successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/contact/:id')
  @ApiNotFoundResponse('Contact', '/api/v1/contact/:id')
  async update(
    @Param('id') id: string,
    @Body() updateContactDto: UpdateContactDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.contactService.update(id, updateContactDto, res);
  }

  /**
   * Delete contact submission (admin only)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete contact submission',
    description: 'Admin endpoint to delete contact submission',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Contact submission deleted successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/contact/:id')
  @ApiNotFoundResponse('Contact', '/api/v1/contact/:id')
  async remove(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.contactService.remove(id, res);
  }
}
