import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto';
import { ApiResponse } from '../common/utils/api-response.util';

/**
 * Service for managing permissions
 */
@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Create a new permission
   */
  async create(
    createPermissionDto: CreatePermissionDto,
    res: Response,
  ): Promise<Response> {
    try {
      this.logger.log(`Creating permission: ${createPermissionDto.name}`);

      const existingPermission = await this.permissionRepository.findOne({
        where: { name: createPermissionDto.name },
      });

      if (existingPermission) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'Permission with this name already exists',
        });
      }

      const permission = this.permissionRepository.create(createPermissionDto);
      const savedPermission = await this.permissionRepository.save(permission);

      this.logger.log(`Permission created successfully: ${savedPermission.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedPermission,
        message: 'Permission created successfully',
        meta: {
          permission_id: savedPermission.id,
          created_at: savedPermission.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create permission: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create permission',
      });
    }
  }

  /**
   * Get all permissions
   */
  async findAll(res: Response): Promise<Response> {
    try {
      const permissions = await this.permissionRepository.find({
        order: { resource: 'ASC', action: 'ASC' },
      });

      // Group by resource for better organization
      const grouped = permissions.reduce(
        (acc, permission) => {
          if (!acc[permission.resource]) {
            acc[permission.resource] = [];
          }
          acc[permission.resource].push(permission);
          return acc;
        },
        {} as Record<string, Permission[]>,
      );

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: { permissions, grouped },
        message: 'Permissions fetched successfully',
        meta: {
          total: permissions.length,
          resources: Object.keys(grouped).length,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch permissions: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch permissions',
      });
    }
  }

  /**
   * Get permission statistics
   */
  async getStatistics(res: Response): Promise<Response> {
    try {
      this.logger.log('Fetching permission statistics');

      const totalPermissions = await this.permissionRepository.count();

      // Count permissions by resource
      const permissions = await this.permissionRepository.find();
      const resourceCounts = permissions.reduce(
        (acc, permission) => {
          const resource = permission.resource;
          acc[resource] = (acc[resource] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalResources = Object.keys(resourceCounts).length;

      this.logger.log('Permission statistics fetched successfully');

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: {
          total: totalPermissions,
          resources: totalResources,
        },
        message: 'Permission statistics fetched successfully',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch permission statistics: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch permission statistics',
      });
    }
  }
}
