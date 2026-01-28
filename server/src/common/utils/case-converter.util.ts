/**
 * Converts object keys from snake_case to camelCase recursively
 * Handles nested objects and arrays
 *
 * @param obj - Object to convert (can be object, array, or primitive)
 * @returns Converted object with camelCase keys
 *
 * @example
 * ```typescript
 * const result = toCamelCase({ user_name: 'John', user_id: 1 });
 * // Returns: { userName: 'John', userId: 1 }
 * ```
 */
export function toCamelCase<T = unknown>(obj: unknown): T {
  // Return null/undefined as-is
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  // Handle arrays recursively
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }

  // Handle plain objects recursively
  if (typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
          letter.toUpperCase(),
        );
        result[camelKey] = toCamelCase((obj as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }

  // Return primitives as-is
  return obj as T;
}

/**
 * Converts object keys from camelCase to snake_case recursively
 * Handles nested objects and arrays
 *
 * @param obj - Object to convert (can be object, array, or primitive)
 * @returns Converted object with snake_case keys
 *
 * @example
 * ```typescript
 * const result = toSnakeCase({ userName: 'John', userId: 1 });
 * // Returns: { user_name: 'John', user_id: 1 }
 * ```
 */
export function toSnakeCase<T = unknown>(obj: unknown): T {
  // Return null/undefined as-is
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  // Handle arrays recursively
  if (Array.isArray(obj)) {
    return obj.map((item) => toSnakeCase(item)) as T;
  }

  // Handle plain objects recursively
  if (typeof obj === 'object' && obj.constructor === Object) {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Convert camelCase to snake_case
        const snakeKey = key.replace(
          /[A-Z]/g,
          (letter) => `_${letter.toLowerCase()}`,
        );
        result[snakeKey] = toSnakeCase((obj as Record<string, unknown>)[key]);
      }
    }
    return result as T;
  }

  // Return primitives as-is
  return obj as T;
}
