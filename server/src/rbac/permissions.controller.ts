import {
  Controller,
  Get,
  Post,
  Body,
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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

/**
 * Controller for permission management
 */
@ApiTags('RBAC - Permissions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Roles('Admin')
  @ApiOperation({ summary: 'Create a new permission (Admin only)' })
  @ApiResponseDecorator({
    status: HttpStatus.CREATED,
    description: 'Permission created successfully',
  })
  @ApiBadRequestResponse('/api/v1/permissions')
  @ApiConflictResponse('Permission already exists', '/api/v1/permissions')
  @ApiUnauthorizedResponse('/api/v1/permissions')
  @ApiForbiddenResponse('/api/v1/permissions')
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
    @Res() res: Response,
  ) {
    return this.permissionsService.create(createPermissionDto, res);
  }

  @Get()
  @Roles('Admin', 'Moderator')
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Permissions fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/permissions')
  async findAll(@Res() res: Response) {
    return this.permissionsService.findAll(res);
  }

  @Get('statistics')
  @SkipThrottle() // Skip rate limiting for statistics
  @Roles('Admin', 'Moderator')
  @ApiOperation({ summary: 'Get permission statistics' })
  @ApiResponseDecorator({
    status: HttpStatus.OK,
    description: 'Permission statistics fetched successfully',
  })
  @ApiUnauthorizedResponse('/api/v1/permissions/statistics')
  async getStatistics(@Res() res: Response) {
    return this.permissionsService.getStatistics(res);
  }
}
