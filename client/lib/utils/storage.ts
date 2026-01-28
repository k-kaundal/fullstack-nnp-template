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
    return item ? (JSON.parse(item) as T) : null;
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
    localStorage.setItem(key, JSON.stringify(value));
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
