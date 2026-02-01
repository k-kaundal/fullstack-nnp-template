import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { ApiResponse } from '../common/utils/api-response.util';

/**
 * Service for managing roles
 */
@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Create a new role
   */
  async create(createRoleDto: CreateRoleDto, res: Response): Promise<Response> {
    try {
      this.logger.log(`Creating role: ${createRoleDto.name}`);

      // Check if role already exists
      const existingRole = await this.roleRepository.findOne({
        where: { name: createRoleDto.name },
      });

      if (existingRole) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.CONFLICT,
          message: 'Role with this name already exists',
        });
      }

      // Create role
      const role = this.roleRepository.create({
        name: createRoleDto.name,
        description: createRoleDto.description,
        isSystemRole: createRoleDto.isSystemRole || false,
      });

      // Assign permissions if provided
      if (
        createRoleDto.permissionIds &&
        createRoleDto.permissionIds.length > 0
      ) {
        const permissions = await this.permissionRepository.findByIds(
          createRoleDto.permissionIds,
        );
        role.permissions = permissions;
      }

      const savedRole = await this.roleRepository.save(role);

      this.logger.log(`Role created successfully: ${savedRole.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.CREATED,
        data: savedRole,
        message: 'Role created successfully',
        meta: {
          role_id: savedRole.id,
          created_at: savedRole.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create role: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to create role',
      });
    }
  }

  /**
   * Get all roles with pagination
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    res: Response,
  ): Promise<Response> {
    try {
      const skip = (page - 1) * limit;

      const [roles, total] = await this.roleRepository.findAndCount({
        relations: ['permissions'],
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const totalPages = Math.ceil(total / limit);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: roles,
        message: 'Roles fetched successfully',
        meta: {
          total,
          count: roles.length,
          page,
          limit,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_previous: page > 1,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch roles: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch roles',
      });
    }
  }

  /**
   * Get single role by ID
   */
  async findOne(id: string, res: Response): Promise<Response> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions', 'users'],
      });

      if (!role) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Role not found',
        });
      }

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: role,
        message: 'Role fetched successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to fetch role: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch role',
      });
    }
  }

  /**
   * Update role
   */
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    res: Response,
  ): Promise<Response> {
    try {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['permissions'],
      });

      if (!role) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Role not found',
        });
      }

      // Check if trying to update system role
      if (
        role.isSystemRole &&
        updateRoleDto.name &&
        role.name !== updateRoleDto.name
      ) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Cannot modify system role name',
        });
      }

      // Update basic fields
      if (updateRoleDto.name) role.name = updateRoleDto.name;
      if (updateRoleDto.description)
        role.description = updateRoleDto.description;

      // Update permissions if provided
      if (updateRoleDto.permissionIds) {
        const permissions = await this.permissionRepository.findByIds(
          updateRoleDto.permissionIds,
        );
        role.permissions = permissions;
      }

      const updatedRole = await this.roleRepository.save(role);

      this.logger.log(`Role updated successfully: ${updatedRole.id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: updatedRole,
        message: 'Role updated successfully',
        meta: {
          role_id: updatedRole.id,
          updated_at: updatedRole.updatedAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update role: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to update role',
      });
    }
  }

  /**
   * Delete role
   */
  async remove(id: string, res: Response): Promise<Response> {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });

      if (!role) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Role not found',
        });
      }

      // Prevent deletion of system roles
      if (role.isSystemRole) {
        return ApiResponse.error(res, {
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Cannot delete system role',
        });
      }

      await this.roleRepository.remove(role);

      this.logger.log(`Role deleted successfully: ${id}`);

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: null,
        message: 'Role deleted successfully',
      });
    } catch (error) {
      this.logger.error(`Failed to delete role: ${error.message}`, error.stack);
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to delete role',
      });
    }
  }

  /**
   * Get role statistics
   */
  async getStatistics(res: Response): Promise<Response> {
    try {
      this.logger.log('Fetching role statistics');

      const totalRoles = await this.roleRepository.count();
      const systemRoles = await this.roleRepository.count({
        where: { isSystemRole: true },
      });
      const customRoles = await this.roleRepository.count({
        where: { isSystemRole: false },
      });

      this.logger.log('Role statistics fetched successfully');

      return ApiResponse.success(res, {
        statusCode: HttpStatus.OK,
        data: {
          total: totalRoles,
          system: systemRoles,
          custom: customRoles,
        },
        message: 'Role statistics fetched successfully',
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch role statistics: ${error.message}`,
        error.stack,
      );
      return ApiResponse.error(res, {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message || 'Failed to fetch role statistics',
      });
    }
  }
}
