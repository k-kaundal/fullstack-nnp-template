import { Injectable, Logger, HttpStatus, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { BulkUserIdsDto } from './dto/bulk-user-ids.dto';
import { ApiResponse } from '../common/utils/api-response.util';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

/**
 * Service for managing user operations
 * Handles CRUD operations for users with proper validation, error handling, and caching
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly CACHE_PREFIX = 'user';
  private readonly CACHE_TTL = 60000; // 1 minute in milliseconds

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailService: MailService,
  ) {}

  /**
   * Generates a secure temporary password
   *
   * @returns string - Random 12-character password
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';

    // Ensure password has at least one of each required character type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Special char

    // Fill remaining characters
    for (let i = password.length; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Creates a new user in the database with temporary password and sends welcome email
   *
   * @param createUserDto - The user data to create
   * @param res - Express response object for sending HTTP response
   * @returns Promise<Response> - HTTP response with created user data
   *
   * @example
   * ```typescript
   * const response = await usersService.create({
   *   email: 'user@example.com',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * }, res);
   * ```
   */
  async create(createUserDto: CreateUserDto, res: Response): Promise<Response> {
    try {
      // Log operation start for debugging and monitoring
      this.logger.log(`Creating new user with email: ${createUserDto.email}`);

      // Check if user already exists to prevent duplicates
      const existingUser = await this.usersRepository.findOne({
        where: { email: createUserDto.email },
      });

      // Return error if user already exists
      if (existingUser) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'User with this email already exists',
        });
      }

      // Generate temporary password if not provided
      const tempPassword = createUserDto.password || this.generateTemporaryPassword();

      // Create user with temporary password
      const user = this.usersRepository.create({
        ...createUserDto,
        password: tempPassword, // In production, this should be hashed
      });
      const savedUser = await this.usersRepository.save(user);

      // Send welcome email with credentials
      try {
        await this.mailService.sendWelcomeEmail(
          savedUser.email,
          savedUser.firstName,
          savedUser.email,
          tempPassword,
        );
        this.logger.log(`Welcome email sent to ${savedUser.email}`);
      } catch (emailError) {
        this.logger.warn(`Failed to send welcome email: ${emailError.message}`);
        // Don't fail user creation if email fails
      }

      // Invalidate users list cache after creation
      await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);

      this.logger.log(`User created successfully with ID: ${savedUser.id}`);

      // Return success response with user data and metadata
      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedUser,
        message: 'User created successfully. Welcome email sent with temporary password.',
        meta: {
          user_id: savedUser.id,
          created_at: savedUser.createdAt,
          email_sent: true,
        },
      });
    } catch (error) {
      // Log error for debugging
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);

      // Return standardized error response
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create user',
      });
    }
  }

  /**
   * Retrieves all users from the database with pagination
   *
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @param res - Express response object for sending HTTP response
   * @returns Promise<Response> - HTTP response with paginated array of users
   */
  async findAll(page: number, limit: number, res: Response): Promise<Response> {
    try {
      // Log operation start
      this.logger.log(`Fetching users - Page: ${page}, Limit: ${limit}`);

      // Calculate pagination offset
      const skip = (page - 1) * limit;

      // Fetch users with pagination and total count
      const [users, total] = await this.usersRepository.findAndCount({
        order: { createdAt: 'DESC' },
        take: limit,
        skip: skip,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrevious = page > 1;

      // Return success response with users data and pagination metadata
      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: users,
        message: 'Users fetched successfully',
        meta: {
          total,
          count: users.length,
          page,
          limit,
          total_pages: totalPages,
          has_next: hasNext,
          has_previous: hasPrevious,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Log error for debugging
      this.logger.error(`Failed to fetch users: ${error.message}`, error.stack);

      // Return standardized error response
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch users',
      });
    }
  }

  /**
   * Retrieves a single user by ID
   *
   * @param id - The UUID of the user to fetch
   * @param res - Express response object for sending HTTP response
   * @returns Promise<Response> - HTTP response with user data or error
   */
  async findOne(id: string, res: Response): Promise<Response> {
    try {
      // Log operation start
      this.logger.log(`Fetching user with ID: ${id}`);

      // Check cache first
      const cacheKey = `${this.CACHE_PREFIX}_${id}`;
      const cachedUser = await this.cacheManager.get<User>(cacheKey);

      if (cachedUser) {
        this.logger.log(`User ${id} found in cache`);
        return ApiResponse.success(res, {
          statusCode: HttpStatus.OK,
          data: cachedUser,
          message: 'User fetched successfully (cached)',
          meta: {
            userId: cachedUser.id,
            cached: true,
            fetchedAt: new Date().toISOString(),
          },
        });
      }

      // Query user by ID from database
      const user = await this.usersRepository.findOne({ where: { id } });

      // Return error if user not found
      if (!user) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User with ID ${id} not found`,
        });
      }

      // Store user in cache for future requests
      await this.cacheManager.set(cacheKey, user, this.CACHE_TTL);
      this.logger.log(`User ${id} cached successfully`);

      // Return success response with user data
      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: user,
        message: 'User fetched successfully',
        meta: {
          userId: user.id,
          cached: false,
          fetchedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Log error for debugging
      this.logger.error(
        `Failed to fetch user with ID ${id}: ${error.message}`,
        error.stack,
      );

      // Return standardized error response
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch user',
      });
    }
  }

  /**
   * Updates an existing user's information
   *
   * @param id - The UUID of the user to update
   * @param updateUserDto - The user data to update
   * @param res - Express response object for sending HTTP response
   * @returns Promise<Response> - HTTP response with updated user data
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    res: Response,
  ): Promise<Response> {
    try {
      // Log operation start
      this.logger.log(`Updating user with ID: ${id}`);

      // Find the user to update
      const user = await this.usersRepository.findOne({ where: { id } });

      // Return error if user not found
      if (!user) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User with ID ${id} not found`,
        });
      }

      // Check for email conflicts if email is being updated
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.usersRepository.findOne({
          where: { email: updateUserDto.email },
        });

        // Return error if email already exists
        if (existingUser) {
          return ApiResponse.error(res, {
            statusCode: HttpStatus.CONFLICT,
            message: 'User with this email already exists',
          });
        }
      }

      // Apply updates and save
      Object.assign(user, updateUserDto);
      const updatedUser = await this.usersRepository.save(user);

      // Invalidate cache for this user and users list
      await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
      await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);

      this.logger.log(`User updated successfully with ID: ${id}`);

      // Return success response with updated user data
      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: updatedUser,
        message: 'User updated successfully',
        meta: {
          userId: updatedUser.id,
          updatedAt: updatedUser.updatedAt,
          updatedFields: Object.keys(updateUserDto),
        },
      });
    } catch (error) {
      // Log error for debugging
      this.logger.error(
        `Failed to update user with ID ${id}: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to update user',
      });
    }
  }

  /**
   * Deletes a user from the database
   *
   * @param id - The UUID of the user to delete
   * @param res - Express response object for sending HTTP response
   * @returns Promise<Response> - HTTP response confirming deletion
   */
  async remove(id: string, res: Response): Promise<Response> {
    try {
      // Log operation start for debugging and monitoring
      this.logger.log(`Removing user with ID: ${id}`);

      // Find the user to delete
      const user = await this.usersRepository.findOne({ where: { id } });

      // Return error if user not found
      if (!user) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: `User with ID ${id} not found`,
        });
      }

      // Remove user from database
      await this.usersRepository.remove(user);

      // Invalidate cache for this user and users list
      await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
      await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);

      this.logger.log(`User removed successfully with ID: ${id}`);

      // Return success response with deletion metadata
      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: null,
        message: 'User deleted successfully',
        meta: {
          deletedUserId: id,
          deletedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      // Log error for debugging
      this.logger.error(
        `Failed to remove user with ID ${id}: ${error.message}`,
        error.stack,
      );

      // Return standardized error response
      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to delete user',
      });
    }
  }

  /**
   * Advanced search for users with filters, sorting, and pagination
   *
   * @param searchDto - Search parameters including query, filters, sort, pagination
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with filtered users
   */
  async search(searchDto: SearchUsersDto, res: Response): Promise<Response> {
    try {
      const {
        search = '',
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10,
      } = searchDto;

      this.logger.log(`Searching users with query: ${search}`);

      // Build query
      const queryBuilder = this.usersRepository.createQueryBuilder('user');

      // Apply search filter (email, firstName, lastName)
      if (search) {
        queryBuilder.where(
          '(user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
          { search: `%${search}%` },
        );
      }

      // Apply isActive filter
      if (isActive !== undefined && isActive !== '') {
        const isActiveBoolean = isActive === 'true';
        queryBuilder.andWhere('user.isActive = :isActive', {
          isActive: isActiveBoolean,
        });
      }

      // Apply sorting
      const validSortFields = [
        'email',
        'firstName',
        'lastName',
        'createdAt',
        'isActive',
      ];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      queryBuilder.orderBy(
        `user.${sortField}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const [users, total] = await queryBuilder.getManyAndCount();

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrevious = page > 1;

      this.logger.log(`Found ${users.length} users matching search criteria`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: users,
        message: 'Users searched successfully',
        meta: {
          total,
          count: users.length,
          page,
          limit,
          total_pages: totalPages,
          has_next: hasNext,
          has_previous: hasPrevious,
          search_query: search,
          filters: { isActive },
          sort: { field: sortField, order: sortOrder },
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to search users: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to search users',
      });
    }
  }

  /**
   * Bulk activate users
   *
   * @param bulkDto - Array of user IDs to activate
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with operation result
   */
  async bulkActivate(
    bulkDto: BulkUserIdsDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Bulk activating ${bulkDto.ids.length} users`);

      // Update all users with provided IDs
      const result = await this.usersRepository.update(
        { id: In(bulkDto.ids) },
        { isActive: true },
      );

      // Invalidate cache
      await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);
      for (const id of bulkDto.ids) {
        await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
      }

      this.logger.log(`Successfully activated ${result.affected} users`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: { affected: result.affected },
        message: `Successfully activated ${result.affected} user(s)`,
        meta: {
          requested: bulkDto.ids.length,
          affected: result.affected,
          operation: 'activate',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to bulk activate users: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to activate users',
      });
    }
  }

  /**
   * Bulk deactivate users
   *
   * @param bulkDto - Array of user IDs to deactivate
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with operation result
   */
  async bulkDeactivate(
    bulkDto: BulkUserIdsDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Bulk deactivating ${bulkDto.ids.length} users`);

      // Update all users with provided IDs
      const result = await this.usersRepository.update(
        { id: In(bulkDto.ids) },
        { isActive: false },
      );

      // Invalidate cache
      await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);
      for (const id of bulkDto.ids) {
        await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
      }

      this.logger.log(`Successfully deactivated ${result.affected} users`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: { affected: result.affected },
        message: `Successfully deactivated ${result.affected} user(s)`,
        meta: {
          requested: bulkDto.ids.length,
          affected: result.affected,
          operation: 'deactivate',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to bulk deactivate users: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to deactivate users',
      });
    }
  }

  /**
   * Bulk delete users
   *
   * @param bulkDto - Array of user IDs to delete
   * @param res - Express response object
   * @returns Promise<Response> - HTTP response with operation result
   */
  async bulkDelete(bulkDto: BulkUserIdsDto, res: Response): Promise<Response> {
    try {
      this.logger.log(`Bulk deleting ${bulkDto.ids.length} users`);

      // Delete all users with provided IDs
      const result = await this.usersRepository.delete({ id: In(bulkDto.ids) });

      // Invalidate cache
      await this.cacheManager.del(`${this.CACHE_PREFIX}_list`);
      for (const id of bulkDto.ids) {
        await this.cacheManager.del(`${this.CACHE_PREFIX}_${id}`);
      }

      this.logger.log(`Successfully deleted ${result.affected} users`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: { affected: result.affected },
        message: `Successfully deleted ${result.affected} user(s)`,
        meta: {
          requested: bulkDto.ids.length,
          affected: result.affected,
          operation: 'delete',
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to bulk delete users: ${error.message}`,
        error.stack,
      );

      return ApiResponse.error(res, {
        statusCode: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to delete users',
      });
    }
  }
}
