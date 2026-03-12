import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { bookingApi } from '../api/booking';
import type { BookingStatusResponse } from '../types/type';

// VNPay response codes
const VNPAY_SUCCESS_CODE = '00';

const vnpayErrorMessages: Record<string, string> = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
  '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
  '10': 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch',
  '12': 'Thẻ/Tài khoản của khách hàng bị khóa',
  '13': 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP)',
  '24': 'Khách hàng hủy giao dịch',
  '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch',
  '65': 'Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày',
  '75': 'Ngân hàng thanh toán đang bảo trì',
  '79': 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định',
  '99': 'Lỗi không xác định',
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState<BookingStatusResponse | null>(null);

  // Get VNPay response params
  const responseCode = searchParams.get('vnp_ResponseCode') || '';
  const txnRef = searchParams.get('vnp_TxnRef') || '';
  const amount = searchParams.get('vnp_Amount');
  const orderInfo = searchParams.get('vnp_OrderInfo') || '';

  const isSuccess = responseCode === VNPAY_SUCCESS_CODE;
  const errorMessage = vnpayErrorMessages[responseCode] || 'Lỗi không xác định';

  // Parse booking ID from txnRef or orderInfo
  const bookingId = txnRef ? parseInt(txnRef.split('_')[0]) : null;

  // Process VNPay IPN and verify booking status from backend
  useEffect(() => {
    const processPaymentResult = async () => {
      // Get full query string from URL to send to IPN endpoint
      const queryString = searchParams.toString();

      if (!queryString) {
        setIsLoading(false);
        return;
      }

      try {
        // Step 1: Call IPN endpoint to update booking status in DB
        console.log('Processing VNPay IPN...');
        await bookingApi.processVnpayIpn(queryString);
        console.log('VNPay IPN processed successfully');
      } catch (error) {
        console.error('Error processing VNPay IPN:', error);
        // Continue to show result even if IPN fails
        // (Backend IPN from VNPay will handle it as backup)
      }

      // Step 2: Verify booking status from backend
      if (bookingId && !isNaN(bookingId)) {
        try {
          const status = await bookingApi.getBookingStatus(bookingId);
          setBookingStatus(status);
        } catch (error) {
          console.error('Error fetching booking status:', error);
        }
      }

      setIsLoading(false);
    };

    processPaymentResult();
  }, [searchParams, bookingId]);

  const handleGoToFields = () => {
    navigate('/fields');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <svg className="w-12 h-12 mx-auto text-brand animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p className="text-muted-foreground">Đang xác nhận giao dịch...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center pb-2">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            {isSuccess ? (
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <CardTitle className={`text-2xl ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
            {isSuccess ? 'Đặt sân thành công!' : 'Thanh toán thất bại'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Message */}
          <p className="text-center text-muted-foreground">
            {isSuccess
              ? 'Cảm ơn bạn đã đặt sân. Chúng tôi đã ghi nhận đơn đặt sân của bạn.'
              : errorMessage
            }
          </p>

          {/* Transaction Details */}
          <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
            {amount && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số tiền:</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(parseInt(amount) / 100)}
                </span>
              </div>
            )}
            {txnRef && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mã giao dịch:</span>
                <span className="font-mono text-foreground">{txnRef}</span>
              </div>
            )}
            {orderInfo && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nội dung:</span>
                <span className="text-foreground truncate max-w-[180px]" title={decodeURIComponent(orderInfo)}>
                  {decodeURIComponent(orderInfo)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái:</span>
              <span className={`font-medium ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                {isSuccess ? 'Thành công' : `Thất bại (${responseCode})`}
              </span>
            </div>

            {/* Backend booking status (if available) */}
            {bookingStatus && (
              <>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trạng thái đặt sân:</span>
                  <span className={`font-medium ${bookingStatus.bookingStatus === 'CONFIRMED' ? 'text-green-500' :
                    bookingStatus.bookingStatus === 'PENDING' ? 'text-yellow-500' : 'text-red-500'
                    }`}>
                    {bookingStatus.bookingStatus === 'CONFIRMED' ? 'Đã xác nhận' :
                      bookingStatus.bookingStatus === 'PENDING' ? 'Đang xử lý' :
                        bookingStatus.bookingStatus === 'CANCELLED' ? 'Đã hủy' : bookingStatus.bookingStatus}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleGoToFields}
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Xem danh sách sân
            </Button>
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Về trang chủ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentResultPage;
