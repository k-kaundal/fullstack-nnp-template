import { apiClient } from './client';
import {
  BlogPost,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogStatistics,
  BlogCategory,
  CreateBlogCategoryDto,
  UpdateBlogCategoryDto,
} from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

/**
 * Service for managing blog posts
 * Handles CRUD operations and blog statistics
 */
export class BlogService {
  /**
   * Get all blog posts (admin)
   */
  async getAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    category?: string,
    search?: string
  ): Promise<ApiSuccessResponse<BlogPost[]> | ApiErrorResponse> {
    const params: Record<string, string | number | boolean | undefined> = { page, limit };
    if (status) params.status = status;
    if (category) params.category = category;
    if (search) params.search = search;

    return apiClient.get<BlogPost[]>('/blog/admin', params);
  }

  /**
   * Get published blog posts (public)
   */
  async getPublished(
    page: number = 1,
    limit: number = 10,
    category?: string,
    search?: string
  ): Promise<ApiSuccessResponse<BlogPost[]> | ApiErrorResponse> {
    const params: Record<string, string | number | boolean | undefined> = { page, limit };
    if (category) params.category = category;
    if (search) params.search = search;

    return apiClient.get<BlogPost[]>('/blog/published', params);
  }

  /**
   * Get blog post by ID (admin)
   */
  async getById(id: string): Promise<ApiSuccessResponse<BlogPost> | ApiErrorResponse> {
    return apiClient.get<BlogPost>(`/blog/${id}`);
  }

  /**
   * Get blog post by slug (public)
   */
  async getBySlug(slug: string): Promise<ApiSuccessResponse<BlogPost> | ApiErrorResponse> {
    return apiClient.get<BlogPost>(`/blog/slug/${slug}`);
  }

  /**
   * Create new blog post
   */
  async create(data: CreateBlogPostDto): Promise<ApiSuccessResponse<BlogPost> | ApiErrorResponse> {
    return apiClient.post<BlogPost>('/blog', data as unknown as Record<string, unknown>);
  }

  /**
   * Update blog post
   */
  async update(
    id: string,
    data: UpdateBlogPostDto
  ): Promise<ApiSuccessResponse<BlogPost> | ApiErrorResponse> {
    return apiClient.patch<BlogPost>(`/blog/${id}`, data as Record<string, unknown>);
  }

  /**
   * Delete blog post
   */
  async delete(id: string): Promise<ApiSuccessResponse<{ id: string }> | ApiErrorResponse> {
    return apiClient.delete<{ id: string }>(`/blog/${id}`);
  }

  /**
   * Get blog statistics
   */
  async getStatistics(): Promise<ApiSuccessResponse<BlogStatistics> | ApiErrorResponse> {
    return apiClient.get<BlogStatistics>('/blog/statistics');
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiSuccessResponse<string[]> | ApiErrorResponse> {
    return apiClient.get<string[]>('/blog/categories');
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<ApiSuccessResponse<string[]> | ApiErrorResponse> {
    return apiClient.get<string[]>('/blog/tags');
  }

  /**
   * Get all categories with full details
   */
  async getAllCategories(): Promise<ApiSuccessResponse<BlogCategory[]> | ApiErrorResponse> {
    return apiClient.get<BlogCategory[]>('/blog/categories');
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string): Promise<ApiSuccessResponse<BlogCategory> | ApiErrorResponse> {
    return apiClient.get<BlogCategory>(`/blog/categories/${id}`);
  }

  /**
   * Create new category with SEO fields
   */
  async createCategory(
    dto: CreateBlogCategoryDto
  ): Promise<ApiSuccessResponse<BlogCategory> | ApiErrorResponse> {
    return apiClient.post<BlogCategory>(
      '/blog/categories',
      dto as unknown as Record<string, unknown>
    );
  }

  /**
   * Update category
   */
  async updateCategory(
    id: string,
    dto: UpdateBlogCategoryDto
  ): Promise<ApiSuccessResponse<BlogCategory> | ApiErrorResponse> {
    return apiClient.patch<BlogCategory>(`/blog/categories/${id}`, dto as Record<string, unknown>);
  }

  /**
   * Delete category
   */
  async deleteCategory(id: string): Promise<ApiSuccessResponse<{ id: string }> | ApiErrorResponse> {
    return apiClient.delete<{ id: string }>(`/blog/categories/${id}`);
  }
}

export const blogService = new BlogService();
