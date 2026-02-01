import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

/**
 * Controller for role management
 */
@ApiTags('RBAC - Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new role (Admin only)' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Role created successfully',
  })
  @ApiBadRequestResponse('/api/v1/roles')
  @ApiConflictResponse('Role already exists', '/api/v1/roles')
  @ApiUnauthorizedResponse('/api/v1/roles')
  @ApiForbiddenResponse('/api/v1/roles')
  async create(@Body() createRoleDto: CreateRoleDto, @Res() res: Response) {
    return this.rolesService.create(createRoleDto, res);
  }

  @Get()
  @Roles('Admin', 'Moderator')
  @ApiOperation({ summary: 'Get all roles with pagination' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Roles fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/roles')
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Res() res: Response,
  ) {
    return this.rolesService.findAll(
      parseInt(page) || 1,
      parseInt(limit) || 10,
      res,
    );
  }

  @Get('statistics')
  @SkipThrottle() // Skip rate limiting for statistics
  @Roles('Admin', 'Moderator')
  @ApiOperation({ summary: 'Get role statistics' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Role statistics fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/roles/statistics')
  async getStatistics(@Res() res: Response) {
    return this.rolesService.getStatistics(res);
  }

  @Get(':id')
  @Roles('Admin', 'Moderator')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Role fetched successfully',
  })
  @ApiNotFoundResponse('Role', '/api/v1/roles/:id')
  @ApiUnauthorizedResponse('/api/v1/roles/:id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    return this.rolesService.findOne(id, res);
  }

  @Put(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Update role (Admin only)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Role updated successfully',
  })
  @ApiBadRequestResponse('/api/v1/roles/:id')
  @ApiNotFoundResponse('Role', '/api/v1/roles/:id')
  @ApiUnauthorizedResponse('/api/v1/roles/:id')
  @ApiForbiddenResponse('/api/v1/roles/:id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Res() res: Response,
  ) {
    return this.rolesService.update(id, updateRoleDto, res);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({ summary: 'Delete role (Admin only)' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Role deleted successfully',
  })
  @ApiNotFoundResponse('Role', '/api/v1/roles/:id')
  @ApiUnauthorizedResponse('/api/v1/roles/:id')
  @ApiForbiddenResponse('/api/v1/roles/:id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    return this.rolesService.remove(id, res);
  }
}
