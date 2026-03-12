import React, { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '../api/booking';
import { fieldApi } from '../api/field';
import type { AdminBooking, AdminBookingFilter, Field, FieldType, BookingStatus, PageResponse } from '../types/type';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/dialog';
import { toast } from 'sonner';

const fieldTypeLabels: Record<FieldType, string> = {
  SAN_5: 'Sân 5',
  SAN_7: 'Sân 7',
  SAN_11: 'Sân 11',
};

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  PENDING: { label: 'Chờ thanh toán', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-green-500/20 text-green-500 border-green-500/30' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-red-500/20 text-red-500 border-red-500/30' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
};

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState<Omit<PageResponse<AdminBooking>, 'content'> | null>(null);

  // Filters
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedFieldId, setSelectedFieldId] = useState<number | undefined>(undefined);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Action dialogs
  const [confirmDialog, setConfirmDialog] = useState<AdminBooking | null>(null);
  const [cancelDialog, setCancelDialog] = useState<AdminBooking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch fields for filter dropdown
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const data = await fieldApi.getFields();
        setFields(data);
      } catch (error) {
        console.error('Error fetching fields:', error);
      }
    };
    fetchFields();
  }, []);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const filter: AdminBookingFilter = {
        date: formatDateToLocal(selectedDate),
        fieldId: selectedFieldId,
        phone: phoneSearch || undefined,
        page: currentPage,
        size: 10,
      };
      const response = await bookingApi.getAdminBookings(filter);
      console.log(response);
      setBookings(response.content);
      setPageInfo({
        totalPages: response.totalPages,
        totalElements: response.totalElements,
        number: response.number,
        size: response.size,
        first: response.first,
        last: response.last,
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Không thể tải danh sách đặt sân');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedFieldId, phoneSearch, currentPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleConfirmBooking = async () => {
    if (!confirmDialog) return;
    try {
      setIsProcessing(true);
      await bookingApi.confirmBooking(confirmDialog.id);
      toast.success('Đã xác nhận đặt sân');
      setConfirmDialog(null);
      fetchBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast.error('Không thể xác nhận đặt sân');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelDialog) return;
    try {
      setIsProcessing(true);
      await bookingApi.adminCancelBooking(cancelDialog.id);
      toast.success('Đã hủy đặt sân');
      setCancelDialog(null);
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Không thể hủy đặt sân');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý đặt sân</h1>
        <p className="text-muted-foreground">Theo dõi và quản lý lịch đặt sân hàng ngày</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Date Picker */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ngày</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setCurrentPage(0);
                }
              }}
              className="rounded-lg border border-border"
            />
          </CardContent>
        </Card>

        {/* Other Filters */}
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Field Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-muted-foreground mb-1 block">Sân</label>
                <select
                  value={selectedFieldId || ''}
                  onChange={(e) => {
                    setSelectedFieldId(e.target.value ? Number(e.target.value) : undefined);
                    setCurrentPage(0);
                  }}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="">Tất cả sân</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name} ({fieldTypeLabels[field.fieldType]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Search */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-sm text-muted-foreground mb-1 block">SĐT khách hàng</label>
                <input
                  type="text"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  placeholder="Tìm theo số điện thoại..."
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Search Button */}
              <div className="flex items-end">
                <Button onClick={() => { setCurrentPage(0); fetchBookings(); }}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Tìm kiếm
                </Button>
              </div>
            </div>

            {/* Stats */}
            {pageInfo && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Tìm thấy <span className="font-semibold text-foreground">{pageInfo.totalElements}</span> đơn đặt sân
                  {selectedDate && ` ngày ${selectedDate.toLocaleDateString('vi-VN')}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <svg className="w-8 h-8 mx-auto text-brand animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <p className="mt-2 text-muted-foreground">Đang tải...</p>
            </div>
          ) : !bookings?.length ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-muted-foreground">Không có đơn đặt sân nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Khách hàng</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sân</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Thời gian</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Giá tiền</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{booking.username}</p>
                        <p className="text-sm text-muted-foreground">{booking.customerPhone || 'Chưa có SĐT'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{booking.fieldName}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{booking.startTime} - {booking.endTime}</p>
                        <p className="text-sm text-muted-foreground">{new Date(booking.bookingDate).toLocaleDateString('vi-VN')}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-brand">{formatPrice(booking.totalPrice)}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={statusConfig[booking.status].className}>
                          {statusConfig[booking.status].label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {booking.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                                onClick={() => setConfirmDialog(booking)}
                              >
                                Xác nhận
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                                onClick={() => setCancelDialog(booking)}
                              >
                                Hủy
                              </Button>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                              onClick={() => setCancelDialog(booking)}
                            >
                              Hủy đơn
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pageInfo && pageInfo.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Trang {pageInfo.number + 1} / {pageInfo.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageInfo.first}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pageInfo.last}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={(open) => !open && setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận đặt sân</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xác nhận đơn đặt sân này? (Thường dùng khi khách trả tiền mặt tại sân)
            </DialogDescription>
          </DialogHeader>
          {confirmDialog && (
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Khách:</span> {confirmDialog.username}</p>
              <p><span className="text-muted-foreground">Sân:</span> {confirmDialog.fieldName}</p>
              <p><span className="text-muted-foreground">Thời gian:</span> {confirmDialog.startTime} - {confirmDialog.endTime}</p>
              <p><span className="text-muted-foreground">Giá:</span> {formatPrice(confirmDialog.totalPrice)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)} disabled={isProcessing}>
              Hủy bỏ
            </Button>
            <Button onClick={handleConfirmBooking} disabled={isProcessing} className="bg-green-600 hover:bg-green-700">
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => !open && setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500">Hủy đặt sân</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn hủy đơn đặt sân này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {cancelDialog && (
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2 text-sm">
              <p><span className="text-muted-foreground">Khách:</span> {cancelDialog.customerPhone}</p>
              <p><span className="text-muted-foreground">Sân:</span> {cancelDialog.fieldName}</p>
              <p><span className="text-muted-foreground">Thời gian:</span> {cancelDialog.startTime} - {cancelDialog.endTime}</p>
              <p><span className="text-muted-foreground">Giá:</span> {formatPrice(cancelDialog.totalPrice)}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog(null)} disabled={isProcessing}>
              Không hủy
            </Button>
            <Button onClick={handleCancelBooking} disabled={isProcessing} variant="destructive">
              {isProcessing ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default AdminBookingsPage;
