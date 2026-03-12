import apiClient from './client';
import type { UserProfileSummary, UpdatePhoneRequest } from '../types/type';

/**
 * User API service
 * Handles user profile and personal data operations
 */
export const userApi = {
  /**
   * Get user profile summary with stats
   * GET /api/users/profile/summary
   */
  async getProfileSummary(): Promise<UserProfileSummary> {
    const response = await apiClient.get<UserProfileSummary>('/users/profile/summary');
    return response.data;
  },

  /**
   * Update user phone number
   * PUT /api/users/profile/phone
   */
  async updatePhone(request: UpdatePhoneRequest): Promise<void> {
    await apiClient.put('/users/profile/phone', request);
  },
};
