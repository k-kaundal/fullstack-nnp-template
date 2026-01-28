/**
 * API Client utility class
 * Provides type-safe HTTP methods with interceptors for authentication and error handling
 * Uses axios for HTTP requests
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  QueryParams,
  RequestBody,
  ResponseBody,
} from '@/types';
import { API_CONFIG } from '@/constants';
import { StorageKey } from '@/enums';
import { makeApiErrorResponse } from '@/lib/utils/api-response';

/**
 * Utility function to append query parameters to URL
 *
 * @param url - Base URL string
 * @param query - Query parameters object
 * @returns URL with query string appended
 */
function withQueryParams(url: string, query?: QueryParams): string {
  if (!query) return url;

  const stringQuery: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) {
      stringQuery[key] = String(value);
    }
  }

  const queryString = `?${new URLSearchParams(stringQuery).toString()}`;
  return `${url}${queryString}`;
}

/**
 * API Client class
 * Handles all HTTP requests with automatic token injection and error handling
 */
export class ApiClient {
  private client: AxiosInstance;

  /**
   * Creates an instance of ApiClient
   *
   * @param baseURL - API base URL (defaults to env variable or constant)
   */
  constructor(baseURL: string = API_CONFIG.BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Sets up axios request and response interceptors
   * Request: Injects authentication token
   * Response: Handles errors and unauthorized access
   *
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token to headers
    this.client.interceptors.request.use(
      async (config) => {
        let token: string | null = null;

        // Get token from localStorage (client-side only)
        if (typeof window !== 'undefined') {
          token = localStorage.getItem(StorageKey.AUTH_TOKEN);
        }

        // Inject token into Authorization header
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiSuccessResponse>) => response,
      (error) => {
        const apiError = this.handleError(error);

        // Handle unauthorized access - clear token and redirect to login
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(StorageKey.AUTH_TOKEN);
            localStorage.removeItem(StorageKey.USER_DATA);

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }
        }

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Handles axios errors and converts them to ApiErrorResponse format
   *
   * @param error - Axios error object
   * @returns Formatted ApiErrorResponse
   * @private
   */
  private handleError(error: AxiosError<ApiErrorResponse>): ApiErrorResponse {
    // If server returned error response, use it
    if (error.response?.data) {
      return error.response.data;
    }

    // If response exists but no data, create error response
    if (error.response) {
      return makeApiErrorResponse(
        error.response.status,
        error.message || 'An error occurred',
        new Date().toISOString(),
        error.config?.url || ''
      );
    }

    // If no response (network error), create network error response
    if (error.request) {
      return makeApiErrorResponse(
        0,
        'No response from server - check your network connection',
        new Date().toISOString(),
        error.config?.url || ''
      );
    }

    // Fallback for unknown errors
    return makeApiErrorResponse(
      0,
      'Request failed - ' + error.message,
      new Date().toISOString(),
      ''
    );
  }

  /**
   * Performs GET request
   *
   * @param url - Endpoint URL
   * @param query - Query parameters
   * @param config - Axios request configuration
   * @returns Promise resolving to ApiSuccessResponse or ApiErrorResponse
   *
   * @example
   * ```typescript
   * const response = await apiClient.get<User[]>('/users', { page: 1, limit: 10 });
   * if (response.status === 'success') {
   *   console.log(response.data);
   * }
   * ```
   */
  async get<T = ResponseBody>(
    url: string,
    query?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
    return this.client
      .get<ApiSuccessResponse<T>>(withQueryParams(url, query), config)
      .then((response) => response.data as ApiSuccessResponse<T>)
      .catch((err) => this.handleError(err) as ApiErrorResponse);
  }

  /**
   * Performs POST request
   *
   * @param url - Endpoint URL
   * @param data - Request body data
   * @param query - Query parameters
   * @param config - Axios request configuration
   * @returns Promise resolving to ApiSuccessResponse or ApiErrorResponse
   *
   * @example
   * ```typescript
   * const response = await apiClient.post<User>('/users', {
   *   email: 'user@example.com',
   *   firstName: 'John',
   *   lastName: 'Doe'
   * });
   * ```
   */
  async post<T = ResponseBody, D extends RequestBody = RequestBody>(
    url: string,
    data?: D,
    query?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
    return this.client
      .post<ApiSuccessResponse<T>>(withQueryParams(url, query), data, config)
      .then((response) => response.data as ApiSuccessResponse<T>)
      .catch((err) => this.handleError(err) as ApiErrorResponse);
  }

  /**
   * Performs PUT request
   *
   * @param url - Endpoint URL
   * @param data - Request body data
   * @param query - Query parameters
   * @param config - Axios request configuration
   * @returns Promise resolving to ApiSuccessResponse or ApiErrorResponse
   */
  async put<T = ResponseBody, D extends RequestBody = RequestBody>(
    url: string,
    data?: D,
    query?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
    return this.client
      .put<ApiSuccessResponse<T>>(withQueryParams(url, query), data, config)
      .then((response) => response.data as ApiSuccessResponse<T>)
      .catch((err) => this.handleError(err) as ApiErrorResponse);
  }

  /**
   * Performs PATCH request
   *
   * @param url - Endpoint URL
   * @param data - Request body data
   * @param query - Query parameters
   * @param config - Axios request configuration
   * @returns Promise resolving to ApiSuccessResponse or ApiErrorResponse
   *
   * @example
   * ```typescript
   * const response = await apiClient.patch<User>('/users/123', {
   *   firstName: 'Jane'
   * });
   * ```
   */
  async patch<T = ResponseBody, D extends RequestBody = RequestBody>(
    url: string,
    data?: D,
    query?: QueryParams,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
    return this.client
      .patch<ApiSuccessResponse<T>>(withQueryParams(url, query), data, config)
      .then((response) => response.data as ApiSuccessResponse<T>)
      .catch((err) => this.handleError(err) as ApiErrorResponse);
  }

  /**
   * Performs DELETE request
   *
   * @param url - Endpoint URL
   * @param dataOrQuery - Request body data or query parameters
   * @param config - Axios request configuration
   * @returns Promise resolving to ApiSuccessResponse or ApiErrorResponse
   *
   * @example
   * ```typescript
   * // Delete with query params
   * const response = await apiClient.delete('/users/123');
   * // Delete with body (for bulk operations)
   * const response = await apiClient.delete('/users/bulk', { ids: ['id1', 'id2'] });
   * ```
   */
  async delete<T = ResponseBody>(
    url: string,
    dataOrQuery?: QueryParams | RequestBody,
    config?: AxiosRequestConfig
  ): Promise<ApiSuccessResponse<T> | ApiErrorResponse> {
    // If dataOrQuery has 'ids' property, treat it as body data
    if (dataOrQuery && 'ids' in dataOrQuery) {
      return this.client
        .delete<ApiSuccessResponse<T>>(url, { ...config, data: dataOrQuery })
        .then((response) => response.data as ApiSuccessResponse<T>)
        .catch((err) => this.handleError(err) as ApiErrorResponse);
    }

    // Otherwise treat as query params
    return this.client
      .delete<ApiSuccessResponse<T>>(withQueryParams(url, dataOrQuery as QueryParams), config)
      .then((response) => response.data as ApiSuccessResponse<T>)
      .catch((err) => this.handleError(err) as ApiErrorResponse);
  }

  /**
   * Updates the base URL for API requests
   *
   * @param baseURL - New base URL
   */
  setBaseURL(baseURL: string): void {
    this.client.defaults.baseURL = baseURL;
  }

  /**
   * Gets the underlying axios instance
   * Use with caution - prefer using the class methods
   *
   * @returns Axios instance
   */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

// Export singleton instance for application-wide use
export const apiClient = new ApiClient();
