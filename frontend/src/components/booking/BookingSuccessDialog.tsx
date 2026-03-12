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
import { useNavigate } from 'react-router-dom';

interface BookingSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingInfo?: {
    fieldName: string;
    date: string;
    slotTime: string;
    totalPrice: number;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const BookingSuccessDialog: React.FC<BookingSuccessDialogProps> = ({
  isOpen,
  onClose,
  bookingInfo,
}) => {
  const navigate = useNavigate();

  const handleViewBookings = () => {
    onClose();
    navigate('/bookings'); // Navigate to user's bookings page
  };

  const handleContinue = () => {
    onClose();
    navigate('/fields'); // Navigate back to field list
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green/10 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <DialogTitle className="text-xl text-center">
            Đặt sân thành công! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Cảm ơn bạn đã đặt sân. Thông tin đặt sân đã được gửi về email của bạn.
          </DialogDescription>
        </DialogHeader>

        {bookingInfo && (
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sân:</span>
              <span className="font-medium">{bookingInfo.fieldName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày:</span>
              <span className="font-medium">{bookingInfo.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ca:</span>
              <span className="font-medium">{bookingInfo.slotTime}</span>
            </div>
            <hr className="border-border" />
            <div className="flex justify-between text-base">
              <span className="font-medium">Đã thanh toán:</span>
              <span className="font-bold text-green">
                {formatPrice(bookingInfo.totalPrice)}
              </span>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleViewBookings}
            className="w-full sm:w-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Xem lịch đặt
          </Button>
          <Button
            onClick={handleContinue}
            className="w-full sm:w-auto bg-brand text-brand-foreground hover:bg-brand/90"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tiếp tục đặt sân
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingSuccessDialog;
