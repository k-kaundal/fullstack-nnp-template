import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../rbac/entities/role.entity';
import { Permission } from '../../rbac/entities/permission.entity';
import { Seeder } from './seeder.interface';

/**
 * Seeder for default roles and permissions
 * Creates system roles (Admin, User, Moderator, Editor) and permissions
 */
@Injectable()
export class RbacSeeder implements Seeder {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Run the seeder
   */
  async run(): Promise<void> {
    this.logger.log('Seeding RBAC data...');

    // Create permissions first
    await this.seedPermissions();

    // Create roles and assign permissions
    await this.seedRoles();

    this.logger.log('RBAC data seeded successfully');
  }

  /**
   * Rollback the seeder
   */
  async rollback(): Promise<void> {
    this.logger.log('Rolling back RBAC data...');

    // Delete all roles (will cascade delete role-permission relations)
    await this.roleRepository.delete({});
    this.logger.log('Roles deleted');

    // Delete all permissions
    await this.permissionRepository.delete({});
    this.logger.log('Permissions deleted');

    this.logger.log('RBAC data rolled back successfully');
  }

  /**
   * Seed permissions
   */
  private async seedPermissions(): Promise<void> {
    const permissions = [
      // User permissions
      {
        name: 'users:create',
        description: 'Create users',
        resource: 'users',
        action: 'create',
      },
      {
        name: 'users:read',
        description: 'Read users',
        resource: 'users',
        action: 'read',
      },
      {
        name: 'users:update',
        description: 'Update users',
        resource: 'users',
        action: 'update',
      },
      {
        name: 'users:delete',
        description: 'Delete users',
        resource: 'users',
        action: 'delete',
      },
      {
        name: 'users:search',
        description: 'Search users',
        resource: 'users',
        action: 'search',
      },
      {
        name: 'users:bulk-delete',
        description: 'Bulk delete users',
        resource: 'users',
        action: 'bulk-delete',
      },

      // Role permissions
      {
        name: 'roles:create',
        description: 'Create roles',
        resource: 'roles',
        action: 'create',
      },
      {
        name: 'roles:read',
        description: 'Read roles',
        resource: 'roles',
        action: 'read',
      },
      {
        name: 'roles:update',
        description: 'Update roles',
        resource: 'roles',
        action: 'update',
      },
      {
        name: 'roles:delete',
        description: 'Delete roles',
        resource: 'roles',
        action: 'delete',
      },

      // Permission permissions
      {
        name: 'permissions:create',
        description: 'Create permissions',
        resource: 'permissions',
        action: 'create',
      },
      {
        name: 'permissions:read',
        description: 'Read permissions',
        resource: 'permissions',
        action: 'read',
      },

      // User-Role assignment permissions
      {
        name: 'user-roles:assign',
        description: 'Assign roles to users',
        resource: 'user-roles',
        action: 'assign',
      },
      {
        name: 'user-roles:remove',
        description: 'Remove roles from users',
        resource: 'user-roles',
        action: 'remove',
      },

      // Auth permissions
      {
        name: 'auth:manage',
        description: 'Manage authentication',
        resource: 'auth',
        action: 'manage',
      },

      // Content permissions (example for future features)
      {
        name: 'posts:create',
        description: 'Create posts',
        resource: 'posts',
        action: 'create',
      },
      {
        name: 'posts:read',
        description: 'Read posts',
        resource: 'posts',
        action: 'read',
      },
      {
        name: 'posts:update',
        description: 'Update posts',
        resource: 'posts',
        action: 'update',
      },
      {
        name: 'posts:delete',
        description: 'Delete posts',
        resource: 'posts',
        action: 'delete',
      },
      {
        name: 'posts:publish',
        description: 'Publish posts',
        resource: 'posts',
        action: 'publish',
      },
    ];

    for (const permissionData of permissions) {
      const existing = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existing) {
        const permission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(permission);
        this.logger.log(`Created permission: ${permission.name}`);
      }
    }
  }

  /**
   * Seed roles and assign permissions
   */
  private async seedRoles(): Promise<void> {
    // Admin role - has all permissions
    const allPermissions = await this.permissionRepository.find();
    await this.createRoleWithPermissions(
      'Admin',
      'System administrator with full access',
      allPermissions,
      true,
    );

    // User role - basic permissions
    const userPermissions = await this.permissionRepository.find({
      where: [
        { name: 'users:read' },
        { name: 'posts:read' },
        { name: 'posts:create' },
        { name: 'posts:update' },
      ],
    });
    await this.createRoleWithPermissions(
      'User',
      'Regular user with basic permissions',
      userPermissions,
      true,
    );

    // Moderator role - manage content and users
    const moderatorPermissions = await this.permissionRepository.find({
      where: [
        { name: 'users:read' },
        { name: 'users:search' },
        { name: 'roles:read' },
        { name: 'posts:create' },
        { name: 'posts:read' },
        { name: 'posts:update' },
        { name: 'posts:delete' },
        { name: 'posts:publish' },
      ],
    });
    await this.createRoleWithPermissions(
      'Moderator',
      'Content moderator with elevated permissions',
      moderatorPermissions,
      true,
    );

    // Editor role - manage content
    const editorPermissions = await this.permissionRepository.find({
      where: [
        { name: 'posts:create' },
        { name: 'posts:read' },
        { name: 'posts:update' },
        { name: 'posts:delete' },
      ],
    });
    await this.createRoleWithPermissions(
      'Editor',
      'Content editor with content management permissions',
      editorPermissions,
      true,
    );
  }

  /**
   * Create role with permissions
   */
  private async createRoleWithPermissions(
    name: string,
    description: string,
    permissions: Permission[],
    isSystemRole: boolean = false,
  ): Promise<void> {
    const existing = await this.roleRepository.findOne({
      where: { name },
    });

    if (!existing) {
      const role = this.roleRepository.create({
        name,
        description,
        permissions,
        isSystemRole,
      });
      await this.roleRepository.save(role);
      this.logger.log(
        `Created role: ${role.name} with ${permissions.length} permissions`,
      );
    } else {
      this.logger.log(`Role ${name} already exists, skipping`);
    }
  }
}
