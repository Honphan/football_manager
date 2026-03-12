import apiClient from './client';
import type {
  LockSlotRequest,
  LockSlotResponse,
  BookingStatusResponse,
  CancelBookingRequest,
  UserBooking,
  AdminBooking,
  AdminBookingFilter,
  PageResponse,
} from '../types/type';

/**
 * Booking API service
 * Handles slot locking, payment status checking, and booking cancellation
 */
export const bookingApi = {
  /**
   * Lock a slot for booking and get payment information
   * POST /api/bookings/lock
   */
  async lockSlot(request: LockSlotRequest): Promise<LockSlotResponse> {
    const response = await apiClient.post<LockSlotResponse>('/bookings/lock-slot', request);
    return response.data;
  },

  /**
   * Check booking/payment status
   * GET /api/bookings/status/{bookingId}
   */
  async getBookingStatus(bookingId: number): Promise<BookingStatusResponse> {
    const response = await apiClient.get<BookingStatusResponse>(`/bookings/status/${bookingId}`);
    return response.data;
  },

  /**
   * Cancel a pending booking
   * POST /api/bookings/cancel
   */
  async cancelBooking(request: CancelBookingRequest): Promise<void> {
    await apiClient.post('/bookings/cancel', request);
  },

  /**
   * Process VNPay IPN callback to update booking status
   * GET /api/payment/vnpay/ipn
   * @param queryString - Full query string from VNPay return URL
   */
  async processVnpayIpn(queryString: string): Promise<void> {
    await apiClient.get(`/payment/vnpay/ipn?${queryString}`);
  },

  // ============ User Booking History ============

  /**
   * Get current user's booking history
   * GET /api/bookings/my-bookings
   */
  async getMyBookings(): Promise<UserBooking[]> {
    const response = await apiClient.get<PageResponse<UserBooking>>('/bookings/my-bookings');
    return response.data.content;
  },

  // ============ Admin Booking Management ============

  /**
   * Get all bookings with filters and pagination (Admin only)
   * GET /api/admin/bookings
   */
  async getAdminBookings(filter: AdminBookingFilter): Promise<PageResponse<AdminBooking>> {
    const params = new URLSearchParams();
    if (filter.date) params.append('date', filter.date);
    if (filter.fieldId) params.append('fieldId', filter.fieldId.toString());
    if (filter.phone) params.append('phone', filter.phone);
    if (filter.status) params.append('status', filter.status);
    if (filter.page !== undefined) params.append('page', filter.page.toString());
    if (filter.size !== undefined) params.append('size', filter.size.toString());

    const response = await apiClient.get<PageResponse<AdminBooking>>(`/admin/bookings?${params.toString()}`);
    return response.data;
  },

  /**
   * Manually confirm a booking (Admin only)
   * PUT /api/admin/bookings/{id}/confirm
   */
  async confirmBooking(bookingId: number): Promise<void> {
    await apiClient.put(`/admin/bookings/${bookingId}/confirm`);
  },

  /**
   * Cancel a booking by admin
   * PUT /api/admin/bookings/{id}/cancel
   */
  async adminCancelBooking(bookingId: number, reason?: string): Promise<void> {
    await apiClient.put(`/admin/bookings/${bookingId}/cancel`, { reason });
  },
};
