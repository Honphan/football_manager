import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useBookingStore } from '../../stores/bookingStore';
import { useCountdown } from '../../hooks/useCountdown';
import { useBookingPolling } from '../../hooks/useBookingPolling';
import { bookingApi } from '../../api/booking';
import { toast } from 'sonner';
import { PaymentStatus } from '../../types/type';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const PaymentModal: React.FC = () => {
  const {
    currentBooking,
    paymentStatus,
    isPaymentModalOpen,
    reset,
  } = useBookingStore();

  // Start polling when modal is open
  useBookingPolling();

  const handleExpire = () => {
    toast.error('Hết thời gian thanh toán!');
    reset();
  };

  const { formattedTime, isExpired, totalSeconds } = useCountdown(
    currentBooking?.expiresAt ?? null,
    handleExpire
  );

  const handleCancel = async () => {
    if (!currentBooking) return;

    try {
      await bookingApi.cancelBooking({ bookingId: currentBooking.bookingId });
      toast.info('Đã hủy đặt sân');
      reset();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Không thể hủy đặt sân');
    }
  };

  const handleClose = () => {
    // If payment is still pending, ask for confirmation
    if (paymentStatus === PaymentStatus.PENDING) {
      const confirmed = window.confirm(
        'Bạn có chắc muốn đóng? Giao dịch sẽ bị hủy.'
      );
      if (confirmed) {
        handleCancel();
      }
    } else {
      reset();
    }
  };

  if (!currentBooking) return null;

  // Determine timer color based on remaining time
  const getTimerColor = () => {
    if (totalSeconds <= 60) return 'text-red-500'; // Last minute - red
    if (totalSeconds <= 180) return 'text-yellow-500'; // Last 3 minutes - yellow
    return 'text-brand'; // Normal - brand color
  };

  return (
    <Dialog open={isPaymentModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thanh toán đặt sân
          </DialogTitle>
          <DialogDescription>
            Quét mã QR bằng ứng dụng ngân hàng để thanh toán
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Countdown Timer */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Thời gian còn lại</p>
            <div className={`text-4xl font-mono font-bold ${getTimerColor()}`}>
              {formattedTime}
            </div>
            {totalSeconds <= 60 && !isExpired && (
              <p className="text-xs text-red-500 mt-1 animate-pulse">
                Sắp hết thời gian!
              </p>
            )}
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg shadow-md">
              {currentBooking.qrCodeUrl ? (
                <img
                  src={currentBooking.qrCodeUrl}
                  alt="QR Code thanh toán"
                  className="w-48 h-48 object-contain"
                />
              ) : (
                <div className="w-48 h-48 bg-secondary flex items-center justify-center rounded">
                  <svg className="w-12 h-12 text-muted-foreground animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sân:</span>
              <span className="font-medium">{currentBooking.fieldName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày:</span>
              <span className="font-medium">
                {new Date(currentBooking.date).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ca:</span>
              <span className="font-medium">
                {currentBooking.slotStartTime} - {currentBooking.slotEndTime}
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-base">
              <span className="font-medium">Tổng tiền:</span>
              <span className="font-bold text-brand">
                {formatPrice(currentBooking.totalPrice)}
              </span>
            </div>
          </div>

          {/* Polling Status */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Đang chờ xác nhận thanh toán...
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Hủy giao dịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
