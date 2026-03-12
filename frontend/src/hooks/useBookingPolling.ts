import { useEffect, useRef, useCallback } from 'react';
import { bookingApi } from '../api/booking';
import { useBookingStore } from '../stores/bookingStore';
import { PaymentStatus } from '../types/type';

const POLLING_INTERVAL = 5000; // 5 seconds

/**
 * Hook for polling booking status
 * Polls every 5 seconds while booking is pending
 * Automatically stops when payment succeeds, fails, or expires
 */
export function useBookingPolling() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    currentBooking,
    paymentStatus,
    isPolling,
    setPolling,
    updatePaymentStatus,
    updateBookingStatus,
  } = useBookingStore();

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
  }, [setPolling]);

  const checkStatus = useCallback(async () => {
    if (!currentBooking) return;

    try {
      const response = await bookingApi.getBookingStatus(currentBooking.bookingId);

      updatePaymentStatus(response.paymentStatus);
      updateBookingStatus(response.bookingStatus);

      // Stop polling if payment is no longer pending
      if (response.paymentStatus !== PaymentStatus.PENDING) {
        stopPolling();
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
      // Don't stop polling on error, just log it
    }
  }, [currentBooking, updatePaymentStatus, updateBookingStatus, stopPolling]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setPolling(true);

    // Immediate first check
    checkStatus();

    // Then poll every 5 seconds
    intervalRef.current = setInterval(checkStatus, POLLING_INTERVAL);
  }, [checkStatus, setPolling]);

  // Start/stop polling based on booking state
  useEffect(() => {
    if (currentBooking && paymentStatus === PaymentStatus.PENDING) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [currentBooking, paymentStatus, startPolling, stopPolling]);

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
}
