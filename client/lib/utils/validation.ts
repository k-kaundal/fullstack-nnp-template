/**
 * Validation utility functions
 * Common validation helpers for forms and user input
 */

import { REGEX_PATTERNS } from '@/constants';

/**
 * Validates email format
 *
 * @param email - Email string to validate
 * @returns True if email is valid
 *
 * @example
 * ```typescript
 * if (isValidEmail(email)) {
 *   // Proceed with form submission
 * }
 * ```
 */
export function isValidEmail(email: string): boolean {
  return REGEX_PATTERNS.EMAIL.test(email);
}

/**
 * Validates password strength
 * Must contain: uppercase, lowercase, number, special character, min 8 chars
 *
 * @param password - Password string to validate
 * @returns True if password meets requirements
 *
 * @example
 * ```typescript
 * if (isValidPassword(password)) {
 *   // Password is strong enough
 * }
 * ```
 */
export function isValidPassword(password: string): boolean {
  return REGEX_PATTERNS.PASSWORD.test(password);
}

/**
 * Validates UUID format
 *
 * @param uuid - UUID string to validate
 * @returns True if UUID is valid
 *
 * @example
 * ```typescript
 * if (isValidUUID(userId)) {
 *   // Proceed with API call
 * }
 * ```
 */
export function isValidUUID(uuid: string): boolean {
  return REGEX_PATTERNS.UUID.test(uuid);
}

/**
 * Gets password strength label
 *
 * @param password - Password string to evaluate
 * @returns Strength label: 'weak', 'medium', or 'strong'
 *
 * @example
 * ```typescript
 * const strength = getPasswordStrength('MyPass123!');
 * console.log(strength); // 'strong'
 * ```
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 6) return 'weak';
  if (password.length < 8) return 'medium';
  if (isValidPassword(password)) return 'strong';
  return 'medium';
}
