import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse as ApiResponseDecorator,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { AssignRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

/**
 * Controller for user-role assignment
 */
@ApiTags('RBAC - User Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users/:userId/roles')
export class UserRolesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Assign roles to user (Admin only)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Roles assigned successfully',
  })
  @ApiBadRequestResponse('/api/v1/users/:userId/roles')
  @ApiNotFoundResponse('User', '/api/v1/users/:userId/roles')
  @ApiUnauthorizedResponse('/api/v1/users/:userId/roles')
  @ApiForbiddenResponse('/api/v1/users/:userId/roles')
  async assignRoles(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Res() res: Response,
  ) {
    return this.usersService.assignRoles(userId, assignRoleDto.roleIds, res);
  }

  @Get()
  @Roles('Admin', 'Moderator')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'User roles fetched successfully',
  })
  @ApiNotFoundResponse('User', '/api/v1/users/:userId/roles')
  @ApiUnauthorizedResponse('/api/v1/users/:userId/roles')
  async getUserRoles(@Param('userId') userId: string, @Res() res: Response) {
    return this.usersService.getUserRoles(userId, res);
  }

  @Delete(':roleId')
  @Roles('Admin')
  @ApiOperation({ summary: 'Remove role from user (Admin only)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Role removed successfully',
  })
  @ApiNotFoundResponse('User or Role', '/api/v1/users/:userId/roles/:roleId')
  @ApiUnauthorizedResponse('/api/v1/users/:userId/roles/:roleId')
  @ApiForbiddenResponse('/api/v1/users/:userId/roles/:roleId')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Res() res: Response,
  ) {
    return this.usersService.removeRole(userId, roleId, res);
  }
}
