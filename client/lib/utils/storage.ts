/**
 * Storage utility functions
 * Type-safe localStorage wrapper with JSON serialization
 */

import { StorageKey } from '@/enums';

/**
 * Gets an item from localStorage with JSON parsing
 *
 * @param key - Storage key
 * @returns Parsed value or null if not found
 *
 * @example
 * ```typescript
 * const user = getStorageItem<User>(StorageKey.USER_DATA);
 * ```
 */
export function getStorageItem<T>(key: StorageKey | string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    // For simple strings (like tokens), return as-is
    // For objects/arrays, parse as JSON
    try {
      return JSON.parse(item) as T;
    } catch {
      // If JSON parse fails, return as string (for tokens)
      return item as T;
    }
  } catch {
    return null;
  }
}

/**
 * Sets an item in localStorage with JSON stringification
 *
 * @param key - Storage key
 * @param value - Value to store
 *
 * @example
 * ```typescript
 * setStorageItem(StorageKey.USER_DATA, { id: '123', name: 'John' });
 * ```
 */
export function setStorageItem<T>(key: StorageKey | string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    // For strings (like tokens), store as-is
    // For objects/arrays, stringify as JSON
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  } catch {
    // Silently fail - storage might be full or unavailable
  }
}

/**
 * Removes an item from localStorage
 *
 * @param key - Storage key
 *
 * @example
 * ```typescript
 * removeStorageItem(StorageKey.AUTH_TOKEN);
 * ```
 */
export function removeStorageItem(key: StorageKey | string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch {
    // Silently fail
  }
}

/**
 * Clears all items from localStorage
 *
 * @example
 * ```typescript
 * clearStorage(); // Clear all storage on logout
 * ```
 */
export function clearStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.clear();
  } catch {
    // Silently fail
  }
}
