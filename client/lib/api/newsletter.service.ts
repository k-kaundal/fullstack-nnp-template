/**
 * Newsletter API Service
 * Handles newsletter subscription and management
 */

import { apiClient } from './client';
import {
  NewsletterSubscriber,
  SubscribeNewsletterDto,
  SendNewsletterDto,
  NewsletterStatistics,
} from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

export class NewsletterService {
  /**
   * Subscribe to newsletter (public)
   * @param dto - Subscription data
   */
  async subscribe(
    dto: SubscribeNewsletterDto
  ): Promise<ApiSuccessResponse<NewsletterSubscriber> | ApiErrorResponse> {
    return apiClient.post<NewsletterSubscriber>('/newsletter/subscribe', dto);
  }

  /**
   * Unsubscribe from newsletter (public)
   * @param email - Email to unsubscribe
   */
  async unsubscribe(email: string): Promise<ApiSuccessResponse<unknown> | ApiErrorResponse> {
    return apiClient.post<unknown>(`/newsletter/unsubscribe/${email}`, {});
  }

  /**
   * Get all subscribers (admin)
   * @param page - Page number
   * @param limit - Items per page
   */
  async getAll(
    page: number = 1,
    limit: number = 50
  ): Promise<ApiSuccessResponse<NewsletterSubscriber[]> | ApiErrorResponse> {
    return apiClient.get<NewsletterSubscriber[]>('/newsletter', { page, limit });
  }

  /**
   * Get newsletter statistics (admin)
   */
  async getStatistics(): Promise<ApiSuccessResponse<NewsletterStatistics> | ApiErrorResponse> {
    return apiClient.get<NewsletterStatistics>('/newsletter/statistics');
  }

  /**
   * Send newsletter to all active subscribers (admin)
   * @param dto - Newsletter content
   */
  async sendNewsletter(
    dto: SendNewsletterDto
  ): Promise<ApiSuccessResponse<unknown> | ApiErrorResponse> {
    return apiClient.post<unknown>('/newsletter/send', dto);
  }

  /**
   * Delete subscriber (admin)
   * @param id - Subscriber ID
   */
  async delete(id: string): Promise<ApiSuccessResponse<unknown> | ApiErrorResponse> {
    return apiClient.delete<unknown>(`/newsletter/${id}`);
  }
}

export const newsletterService = new NewsletterService();
