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

interface BookingFailedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  reason?: 'expired' | 'failed' | 'cancelled';
  message?: string;
}

const BookingFailedDialog: React.FC<BookingFailedDialogProps> = ({
  isOpen,
  onClose,
  onRetry,
  reason = 'failed',
  message,
}) => {
  const getContent = () => {
    switch (reason) {
      case 'expired':
        return {
          icon: (
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: 'Hết thời gian thanh toán',
          description: 'Thời gian giữ chỗ đã hết. Vui lòng thử đặt lại.',
          bgColor: 'bg-yellow-500/10',
        };
      case 'cancelled':
        return {
          icon: (
            <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          title: 'Đã hủy đặt sân',
          description: 'Giao dịch đã được hủy theo yêu cầu của bạn.',
          bgColor: 'bg-secondary',
        };
      default:
        return {
          icon: (
            <svg className="w-10 h-10 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          title: 'Thanh toán thất bại',
          description: message || 'Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.',
          bgColor: 'bg-destructive/10',
        };
    }
  };

  const content = getContent();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className={`mx-auto mb-4 w-16 h-16 ${content.bgColor} rounded-full flex items-center justify-center`}>
            {content.icon}
          </div>
          <DialogTitle className="text-xl text-center">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>
          {reason !== 'cancelled' && (
            <Button
              onClick={onRetry}
              className="w-full sm:w-auto bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingFailedDialog;
