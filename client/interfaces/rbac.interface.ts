/**
 * Role interface
 * Represents a user role with associated permissions
 */
export interface Role {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission interface
 * Represents a granular permission
 */
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  createdAt: string;
}

/**
 * DTO for creating a new role
 */
export interface CreateRoleDto {
  name: string;
  description: string;
  permissionIds: string[];
  isSystemRole?: boolean;
  [key: string]: string | string[] | boolean | undefined; // Index signature for RequestBody compatibility
}

/**
 * DTO for updating an existing role
 */
export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
  [key: string]: string | string[] | undefined; // Index signature for RequestBody compatibility
}

/**
 * DTO for creating a new permission
 */
export interface CreatePermissionDto {
  name: string;
  description: string;
  resource: string;
  action: string;
  [key: string]: string; // Index signature for RequestBody compatibility
}

/**
 * DTO for assigning roles to a user
 */
export interface AssignRoleDto {
  roleIds: string[];
}
