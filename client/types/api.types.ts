/**
 * API response and request type definitions
 * These types match the backend NestJS API response structure
 */

/**
 * Pagination metadata structure
 */
export interface PaginationMeta {
  total: number;
  count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

/**
 * Generic metadata structure for API responses
 */
export interface ApiMeta extends Record<string, unknown> {
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  cached?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Success API response structure
 * Matches the backend ApiResponse.success() format
 */
export interface ApiSuccessResponse<T = ResponseBody> {
  status: 'success';
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  meta?: PaginationMeta | ApiMeta | null;
  path: string;
}

/**
 * Error API response structure
 * Matches the backend ApiResponse.error() format
 */
export interface ApiErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  errors?: Record<string, string> | string[] | null;
  data?: null;
  meta?: null;
  timestamp: string;
  path: string;
}

/**
 * Axios request configuration
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: QueryParams;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * URL query parameters
 */
export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Generic request body for POST/PUT/PATCH requests
 */
export interface RequestBody {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | null
    | RequestBody
    | RequestBody[]
    | FormData
    | Record<string, unknown>
    | unknown;
}

/**
 * Generic response body structure
 */
export interface ResponseBody {
  [key: string]:
    | string
    | number
    | boolean
    | Date
    | null
    | ResponseBody
    | ResponseBody[]
    | Record<string, unknown>
    | unknown;
}
