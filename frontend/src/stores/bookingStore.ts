import { create } from 'zustand';
import type { LockSlotResponse, PaymentStatus, BookingStatus } from '../types/type';

interface BookingState {
  // Current booking being processed
  currentBooking: LockSlotResponse | null;

  // Payment/booking status
  paymentStatus: PaymentStatus | null;
  bookingStatus: BookingStatus | null;

  // UI states
  isPaymentModalOpen: boolean;
  isProcessing: boolean;
  isPolling: boolean;

  // Error handling
  error: string | null;

  // Actions
  startBooking: (booking: LockSlotResponse) => void;
  updatePaymentStatus: (status: PaymentStatus) => void;
  updateBookingStatus: (status: BookingStatus) => void;
  setPolling: (isPolling: boolean) => void;
  setError: (error: string | null) => void;
  closePaymentModal: () => void;
  reset: () => void;
}

const initialState = {
  currentBooking: null,
  paymentStatus: null,
  bookingStatus: null,
  isPaymentModalOpen: false,
  isProcessing: false,
  isPolling: false,
  error: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  startBooking: (booking) =>
    set({
      currentBooking: booking,
      paymentStatus: 'PENDING',
      bookingStatus: 'PENDING',
      isPaymentModalOpen: true,
      isProcessing: true,
      error: null,
    }),

  updatePaymentStatus: (status) =>
    set({ paymentStatus: status }),

  updateBookingStatus: (status) =>
    set({ bookingStatus: status }),

  setPolling: (isPolling) =>
    set({ isPolling }),

  setError: (error) =>
    set({ error, isProcessing: false }),

  closePaymentModal: () =>
    set({ isPaymentModalOpen: false }),

  reset: () =>
    set(initialState),
}));
