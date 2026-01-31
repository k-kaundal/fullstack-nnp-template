/**
 * User GraphQL Resolver
 * Handles GraphQL queries and mutations for users
 */

import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  ID,
  Context,
} from '@nestjs/graphql';
import {
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { UsersService } from '../../users/users.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';

/**
 * GraphQL resolver for User operations
 * All queries and mutations are protected with JWT authentication
 */
@Resolver('User')
@UseGuards(GqlAuthGuard)
export class UserResolver {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users with pagination
   *
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   * @returns UsersConnection with users array and pagination metadata
   */
  @Query('users')
  async getUsers(
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
    @Context() context: { res: ExpressResponse },
  ) {
    const responseData = await this.usersService.findAll(
      page,
      limit,
      context.res,
    );

    // Extract data from ApiResponse format
    if (
      responseData &&
      (responseData as unknown as { status: string }).status === 'success'
    ) {
      const response = responseData as unknown as {
        data: unknown[];
        meta: {
          total: number;
          page: number;
          limit: number;
          total_pages: number;
          has_next: boolean;
          has_previous: boolean;
        };
      };

      return {
        users: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.total_pages,
        hasNext: response.meta.has_next,
        hasPrevious: response.meta.has_previous,
      };
    }

    throw new BadRequestException(
      (responseData as unknown as { message: string }).message ||
        'Failed to fetch users',
    );
  }

  /**
   * Get user by ID
   *
   * @param id - User UUID
   * @returns User object or null if not found
   */
  @Query('user')
  async getUser(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: { res: ExpressResponse },
  ) {
    const responseData = await this.usersService.findOne(id, context.res);

    if (
      responseData &&
      (responseData as unknown as { status: string }).status === 'success'
    ) {
      return (responseData as unknown as { data: unknown }).data;
    }

    if (
      (responseData as unknown as { statusCode: number }).statusCode === 404
    ) {
      return null;
    }

    throw new BadRequestException(
      (responseData as unknown as { message: string }).message ||
        'Failed to fetch user',
    );
  }

  /**
   * Search users by email
   *
   * @param email - Email to search
   * @returns Array of matching users
   */
  @Query('searchUsers')
  async searchUsers(
    @Args('email') email: string,
    @Context() context: { res: ExpressResponse },
  ) {
    // Implement search logic in UsersService
    const responseData = await this.usersService.findAll(1, 100, context.res);

    if (
      responseData &&
      (responseData as unknown as { status: string }).status === 'success'
    ) {
      const response = responseData as unknown as {
        data: Array<{ email: string }>;
      };
      const users = response.data.filter((user) =>
        user.email.toLowerCase().includes(email.toLowerCase()),
      );
      return users;
    }

    return [];
  }

  /**
   * Create new user
   *
   * @param input - CreateUserInput data
   * @returns Newly created user
   */
  @Mutation('createUser')
  async createUser(
    @Args('input') input: CreateUserDto,
    @Context() context: { res: ExpressResponse },
  ) {
    const responseData = await this.usersService.create(input, context.res);

    if (
      responseData &&
      (responseData as unknown as { status: string }).status === 'success'
    ) {
      return (responseData as unknown as { data: unknown }).data;
    }

    throw new BadRequestException(
      (responseData as unknown as { message: string }).message ||
        'Failed to create user',
    );
  }

  /**
   * Update existing user
   *
   * @param id - User UUID
   * @param input - UpdateUserInput data
   * @returns Updated user
   */
  @Mutation('updateUser')
  async updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateUserDto,
    @Context() context: { res: ExpressResponse },
  ) {
    const responseData = await this.usersService.update(id, input, context.res);

    if (
      responseData &&
      (responseData as unknown as { status: string }).status === 'success'
    ) {
      return (responseData as unknown as { data: unknown }).data;
    }

    if (
      (responseData as unknown as { statusCode: number }).statusCode === 404
    ) {
      throw new NotFoundException(
        (responseData as unknown as { message: string }).message ||
          'User not found',
      );
    }

    throw new BadRequestException(
      (responseData as unknown as { message: string }).message ||
        'Failed to update user',
    );
  }

  /**
   * Delete user
   *
   * @param id - User UUID
   * @returns Boolean indicating success
   */
  @Mutation('deleteUser')
  async deleteUser(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: { res: ExpressResponse },
  ) {
    const responseData = await this.usersService.remove(id, context.res);

    if (
      responseData &&
      (responseData as unknown as { status: string }).status === 'success'
    ) {
      return true;
    }

    if (
      (responseData as unknown as { statusCode: number }).statusCode === 404
    ) {
      throw new NotFoundException(
        (responseData as unknown as { message: string }).message ||
          'User not found',
      );
    }

    return false;
  }

  /**
   * Toggle user active status
   *
   * @param id - User UUID
   * @returns Updated user with toggled status
   */
  @Mutation('toggleUserStatus')
  async toggleUserStatus(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: { res: ExpressResponse },
  ) {
    // Get current user
    const userResponseData = await this.usersService.findOne(id, context.res);

    if (
      !userResponseData ||
      (userResponseData as unknown as { status: string }).status !== 'success'
    ) {
      throw new NotFoundException('User not found');
    }

    const userData = (
      userResponseData as unknown as { data: { isActive: boolean } }
    ).data;

    // Toggle status
    const updateResponseData = await this.usersService.update(
      id,
      { isActive: !userData.isActive },
      context.res,
    );

    if (
      updateResponseData &&
      (updateResponseData as unknown as { status: string }).status === 'success'
    ) {
      return (updateResponseData as unknown as { data: unknown }).data;
    }

    throw new BadRequestException(
      (updateResponseData as unknown as { message: string }).message ||
        'Failed to toggle user status',
    );
  }
}
