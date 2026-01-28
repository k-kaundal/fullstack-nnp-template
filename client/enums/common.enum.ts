/**
 * HTTP status codes enum
 * Provides type-safe HTTP status code constants
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * API response status enum
 */
export enum ApiStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Theme enum
 * Available theme options
 */
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

/**
 * Storage keys enum
 * Centralized storage key management
 */
export enum StorageKey {
  AUTH_TOKEN = 'authToken',
  USER_DATA = 'userData',
  THEME = 'theme',
  LANGUAGE = 'language',
}

/**
 * API endpoints enum
 * Centralized API route management
 */
export enum ApiEndpoint {
  // Auth endpoints
  LOGIN = '/auth/login',
  REGISTER = '/auth/register',
  LOGOUT = '/auth/logout',
  REFRESH_TOKEN = '/auth/refresh',

  // User endpoints
  USERS = '/users',
  USER_BY_ID = '/users/:id',
  USER_PROFILE = '/users/profile',
}
