/**
 * User interface matching backend User entity
 * Used for type-safe user data handling
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User creation data transfer object
 * Used for user registration/creation
 * Password is optional - if not provided, temporary password will be generated
 */
export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Optional - temp password generated if not provided
  [key: string]: string | undefined; // Index signature for RequestBody compatibility
}

/**
 * User update data transfer object
 * All fields are optional for partial updates
 */
export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
  [key: string]: string | boolean | undefined; // Index signature for RequestBody compatibility
}

/**
 * User list response with pagination
 */
export interface UserListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}
