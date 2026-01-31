import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  Res,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { BulkUserIdsDto } from './dto/bulk-user-ids.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
} from '../common/decorators';

/**
 * Controller for managing user-related HTTP endpoints
 * Handles routing and delegates all business logic to UsersService
 *
 * @security JWT Authentication required for all endpoints
 */
@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user
   *
   * @param createUserDto - User data for creation
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with created user
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user with email, first name, last name, and password. Password must be at least 8 characters with uppercase, lowercase, number, and special character. Requires JWT authentication.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'User has been successfully created.',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        message: 'User created successfully',
        data: {
          id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: '2026-01-27T10:23:22.983Z',
          updatedAt: '2026-01-27T10:23:22.983Z',
        },
        meta: {
          user_id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          created_at: '2026-01-27T10:23:22.983Z',
        },
        timestamp: '2026-01-27T10:23:22.997Z',
        path: '/api/v1/users',
      },
    },
  })
  @ApiBadRequestResponse('/api/v1/users')
  @ApiConflictResponse('User with this email already exists', '/api/v1/users')
  @ApiUnauthorizedResponse('/api/v1/users')
  async create(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.create(createUserDto, res);
  }

  /**
   * Retrieves all users with pagination
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with paginated list of users
   */
  @Get()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description:
      'Retrieves a paginated list of users. Use page and limit query parameters to control pagination.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Return all users with pagination.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Users fetched successfully',
        data: [
          {
            id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            createdAt: '2026-01-27T10:23:22.983Z',
            updatedAt: '2026-01-27T10:23:22.983Z',
          },
        ],
        meta: {
          total: 25,
          count: 10,
          page: 2,
          limit: 10,
          total_pages: 3,
          has_next: true,
          has_previous: true,
          timestamp: '2026-01-27T10:28:36.014Z',
        },
        timestamp: '2026-01-27T10:28:36.014Z',
        path: '/api/v1/users',
      },
    },
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Res() res: Response,
  ): Promise<Response> {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    return this.usersService.findAll(pageNumber, limitNumber, res);
  }

  /**
   * Retrieves a specific user by ID
   *
   * @param id - User UUID
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with user data
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get a user by ID',
    description:
      'Retrieves a single user by their UUID. Returns cached data if available.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Return the user.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'User fetched successfully',
        data: {
          id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: '2026-01-27T10:23:22.983Z',
          updatedAt: '2026-01-27T10:23:22.983Z',
        },
        meta: {
          cached: true,
        },
        timestamp: '2026-01-27T10:28:36.014Z',
        path: '/api/v1/users/6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    schema: {
      example: {
        status: 'error',
        statusCode: 404,
        message: 'User not found',
        timestamp: '2026-01-27T10:28:36.014Z',
        path: '/api/v1/users/invalid-id',
      },
    },
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.findOne(id, res);
  }

  /**
   * Updates an existing user
   *
   * @param id - User UUID
   * @param updateUserDto - Updated user data
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with updated user
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a user',
    description:
      'Updates an existing user. All fields are optional. Cache is invalidated after update.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'User has been successfully updated.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'User updated successfully',
        data: {
          id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          email: 'john.updated@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: '2026-01-27T10:23:22.983Z',
          updatedAt: '2026-01-27T10:30:00.000Z',
        },
        meta: {
          user_id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          updated_at: '2026-01-27T10:30:00.000Z',
        },
        timestamp: '2026-01-27T10:30:00.015Z',
        path: '/api/v1/users/6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad Request - Validation failed.',
    schema: {
      example: {
        status: 'error',
        statusCode: 400,
        message: 'Validation failed',
        timestamp: '2026-01-27T10:30:00.015Z',
        path: '/api/v1/users/6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    schema: {
      example: {
        status: 'error',
        statusCode: 404,
        message: 'User not found',
        timestamp: '2026-01-27T10:30:00.015Z',
        path: '/api/v1/users/invalid-id',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.CONFLICT,
    description: 'Conflict - Email already exists.',
    schema: {
      example: {
        status: 'error',
        statusCode: 409,
        message: 'Email already exists',
        timestamp: '2026-01-27T10:30:00.015Z',
        path: '/api/v1/users/6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
      },
    },
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.update(id, updateUserDto, res);
  }

  /**
   * Deletes a user by ID
   *
   * @param id - User UUID
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response confirming deletion
   */
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Permanently deletes a user by their UUID. Cache is invalidated after deletion.',
  })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'User has been successfully deleted.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'User deleted successfully',
        data: null,
        meta: {
          user_id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
          deleted_at: '2026-01-27T10:35:00.000Z',
        },
        timestamp: '2026-01-27T10:35:00.015Z',
        path: '/api/v1/users/6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
      },
    },
  })
  @ApiResponseDecorator({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
    schema: {
      example: {
        status: 'error',
        statusCode: 404,
        message: 'User not found',
        timestamp: '2026-01-27T10:35:00.015Z',
        path: '/api/v1/users/invalid-id',
      },
    },
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.remove(id, res);
  }

  /**
   * Advanced search for users with filters and sorting
   *
   * @param searchDto - Search parameters
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with search results
   */
  @Get('search/advanced')
  @ApiOperation({
    summary: 'Advanced search for users',
    description:
      'Search users with filters (search query, active status), sorting, and pagination.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search query for name or email',
    example: 'john',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: String,
    description: 'Filter by active status',
    example: 'true',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Sort by field',
    example: 'email',
    enum: ['email', 'firstName', 'lastName', 'createdAt', 'isActive'],
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort direction',
    example: 'asc',
    enum: ['asc', 'desc'],
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
    example: 10,
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Users search results with filters and pagination.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Users searched successfully',
        data: [
          {
            id: '6dd9ca2a-4a9f-4155-ad34-4cf6a575eebe',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            isActive: true,
            createdAt: '2026-01-27T10:23:22.983Z',
            updatedAt: '2026-01-27T10:23:22.983Z',
          },
        ],
        meta: {
          total: 15,
          count: 10,
          page: 1,
          limit: 10,
          total_pages: 2,
          has_next: true,
          has_previous: false,
          search_query: 'john',
          filters: { isActive: 'true' },
          sort: { field: 'email', order: 'asc' },
        },
        timestamp: '2026-01-27T10:40:00.000Z',
        path: '/api/v1/users/search/advanced',
      },
    },
  })
  async search(
    @Query() searchDto: SearchUsersDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.search(searchDto, res);
  }

  /**
   * Bulk activate users
   *
   * @param bulkDto - Array of user IDs
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with operation result
   */
  @Post('bulk/activate')
  @ApiOperation({
    summary: 'Bulk activate users',
    description: 'Activates multiple users by their IDs.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Users have been successfully activated.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Successfully activated 5 user(s)',
        data: { affected: 5 },
        meta: {
          requested: 5,
          affected: 5,
          operation: 'activate',
        },
        timestamp: '2026-01-27T10:45:00.000Z',
        path: '/api/v1/users/bulk/activate',
      },
    },
  })
  async bulkActivate(
    @Body() bulkDto: BulkUserIdsDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.bulkActivate(bulkDto, res);
  }

  /**
   * Bulk deactivate users
   *
   * @param bulkDto - Array of user IDs
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with operation result
   */
  @Post('bulk/deactivate')
  @ApiOperation({
    summary: 'Bulk deactivate users',
    description: 'Deactivates multiple users by their IDs.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Users have been successfully deactivated.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Successfully deactivated 3 user(s)',
        data: { affected: 3 },
        meta: {
          requested: 3,
          affected: 3,
          operation: 'deactivate',
        },
        timestamp: '2026-01-27T10:50:00.000Z',
        path: '/api/v1/users/bulk/deactivate',
      },
    },
  })
  async bulkDeactivate(
    @Body() bulkDto: BulkUserIdsDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.bulkDeactivate(bulkDto, res);
  }

  /**
   * Bulk delete users
   *
   * @param bulkDto - Array of user IDs
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with operation result
   */
  @Delete('bulk')
  @ApiOperation({
    summary: 'Bulk delete users',
    description: 'Permanently deletes multiple users by their IDs.',
  })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Users have been successfully deleted.',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        message: 'Successfully deleted 2 user(s)',
        data: { affected: 2 },
        meta: {
          requested: 2,
          affected: 2,
          operation: 'delete',
        },
        timestamp: '2026-01-27T10:55:00.000Z',
        path: '/api/v1/users/bulk',
      },
    },
  })
  async bulkDelete(
    @Body() bulkDto: BulkUserIdsDto,
    @Res() res: Response,
  ): Promise<Response> {
    return this.usersService.bulkDelete(bulkDto, res);
  }
}
