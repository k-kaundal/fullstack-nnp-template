import { apiClient } from './client';
import { Contact, CreateContactDto, UpdateContactDto, ContactStats } from '@/interfaces';
import { ApiSuccessResponse, ApiErrorResponse } from '@/types';

/**
 * Contact API service
 */
export class ContactService {
  /**
   * Submit contact form (public endpoint)
   */
  async submit(dto: CreateContactDto): Promise<ApiSuccessResponse<Contact> | ApiErrorResponse> {
    return apiClient.post<Contact>('/contact', dto);
  }

  /**
   * Get all contact submissions (admin only)
   */
  async getAll(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<ApiSuccessResponse<Contact[]> | ApiErrorResponse> {
    return apiClient.get<Contact[]>('/contact', {
      page,
      limit,
      ...(status && status !== 'all' ? { status } : {}),
    });
  }

  /**
   * Get contact statistics (admin only)
   */
  async getStatistics(): Promise<ApiSuccessResponse<ContactStats> | ApiErrorResponse> {
    return apiClient.get<ContactStats>('/contact/statistics');
  }

  /**
   * Get single contact by ID (admin only)
   */
  async getById(id: string): Promise<ApiSuccessResponse<Contact> | ApiErrorResponse> {
    return apiClient.get<Contact>(`/contact/${id}`);
  }

  /**
   * Update contact status (admin only)
   */
  async updateStatus(
    id: string,
    dto: UpdateContactDto
  ): Promise<ApiSuccessResponse<Contact> | ApiErrorResponse> {
    return apiClient.patch<Contact, UpdateContactDto>(`/contact/${id}`, dto);
  }

  /**
   * Delete contact submission (admin only)
   */
  async delete(id: string): Promise<ApiSuccessResponse<null> | ApiErrorResponse> {
    return apiClient.delete<null>(`/contact/${id}`);
  }
}

export const contactService = new ContactService();
