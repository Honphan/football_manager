import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingApi } from '../api/booking';
import type { UserBooking, BookingStatus } from '../types/type';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';



const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-red-500/20 text-red-500 border-red-500/30' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const data = await bookingApi.getMyBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Không thể tải lịch sử đặt sân');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Lịch sử đặt sân</h1>
          <p className="text-muted-foreground">Xem lại các sân bạn đã đặt</p>
        </div>
        <Button
          onClick={() => navigate('/fields')}
          className="bg-brand text-brand-foreground hover:bg-brand/90"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Đặt sân mới
        </Button>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-16 text-center">
            <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-foreground mb-2">Chưa có lịch đặt sân</h3>
            <p className="text-muted-foreground mb-6">Bạn chưa đặt sân nào. Hãy bắt đầu đặt sân ngay!</p>
            <Button
              onClick={() => navigate('/fields')}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Khám phá sân bóng
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="bg-card border-border hover:border-brand/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Booking Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{booking.fieldName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {booking.slotName}
                      </Badge>
                      <Badge className={statusConfig[booking.status].className}>
                        {statusConfig[booking.status].label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(booking.bookingDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {booking.timeRange}
                      </span>
                    </div>
                  </div>

                  {/* Right: Price */}
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand">{formatPrice(booking.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Đặt ngày {new Date(booking.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      {bookings.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Tổng quan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
                <p className="text-sm text-muted-foreground">Tổng đặt sân</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length}
                </p>
                <p className="text-sm text-muted-foreground">Thành công</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">
                  {bookings.filter(b => b.status === 'PENDING').length}
                </p>
                <p className="text-sm text-muted-foreground">Chờ xử lý</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">
                  {bookings.filter(b => b.status === 'CANCELLED').length}
                </p>
                <p className="text-sm text-muted-foreground">Đã hủy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyBookingsPage;
