import { User } from '@/interfaces';

/**
 * RBAC Utility Functions
 * Helper functions for role and permission checking on client side
 */

/**
 * Check if user has a specific role
 *
 * @param user - User object with roles
 * @param roleName - Name of role to check
 * @returns True if user has the role
 *
 * @example
 * ```typescript
 * if (hasRole(user, 'Admin')) {
 *   // Show admin features
 * }
 * ```
 */
export const hasRole = (user: User | null, roleName: string): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((role) => role.name === roleName);
};

/**
 * Check if user has ANY of the specified roles
 *
 * @param user - User object with roles
 * @param roleNames - Array of role names to check
 * @returns True if user has at least one of the roles
 *
 * @example
 * ```typescript
 * if (hasAnyRole(user, ['Admin', 'Moderator'])) {
 *   // Show moderation features
 * }
 * ```
 */
export const hasAnyRole = (user: User | null, roleNames: string[]): boolean => {
  if (!user || !user.roles) return false;
  return user.roles.some((role) => roleNames.includes(role.name));
};

/**
 * Check if user has ALL of the specified roles
 *
 * @param user - User object with roles
 * @param roleNames - Array of role names to check
 * @returns True if user has all of the roles
 *
 * @example
 * ```typescript
 * if (hasAllRoles(user, ['Admin', 'Verified'])) {
 *   // Show features requiring both roles
 * }
 * ```
 */
export const hasAllRoles = (user: User | null, roleNames: string[]): boolean => {
  if (!user || !user.roles) return false;
  const userRoleNames = user.roles.map((role) => role.name);
  return roleNames.every((roleName) => userRoleNames.includes(roleName));
};

/**
 * Check if user is an admin
 * Convenience function for the most common role check
 *
 * @param user - User object with roles
 * @returns True if user has Admin role
 *
 * @example
 * ```typescript
 * if (isAdmin(user)) {
 *   // Show admin panel
 * }
 * ```
 */
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'Admin');
};

/**
 * Check if user is a moderator
 * Convenience function for moderator role check
 *
 * @param user - User object with roles
 * @returns True if user has Moderator role
 *
 * @example
 * ```typescript
 * if (isModerator(user)) {
 *   // Show moderation tools
 * }
 * ```
 */
export const isModerator = (user: User | null): boolean => {
  return hasRole(user, 'Moderator');
};

/**
 * Get all role names for a user
 *
 * @param user - User object with roles
 * @returns Array of role names
 *
 * @example
 * ```typescript
 * const roles = getUserRoles(user); // ['Admin', 'Moderator']
 * ```
 */
export const getUserRoles = (user: User | null): string[] => {
  if (!user || !user.roles) return [];
  return user.roles.map((role) => role.name);
};

/**
 * Check if user has no roles assigned
 *
 * @param user - User object with roles
 * @returns True if user has no roles
 *
 * @example
 * ```typescript
 * if (hasNoRoles(user)) {
 *   // Show onboarding to assign role
 * }
 * ```
 */
export const hasNoRoles = (user: User | null): boolean => {
  if (!user || !user.roles) return true;
  return user.roles.length === 0;
};
