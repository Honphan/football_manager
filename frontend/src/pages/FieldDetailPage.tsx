import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fieldApi } from '../api/field';
import { bookingApi } from '../api/booking';
import type { Field, TimeSlot, FieldType } from '../types/type';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
import SlotGrid from '../components/booking/SlotGrid';
import BookingSuccessDialog from '../components/booking/BookingSuccessDialog';
import BookingFailedDialog from '../components/booking/BookingFailedDialog';
import { useBookingStore } from '../stores/bookingStore';
import { toast } from 'sonner';

const fieldTypeLabels: Record<FieldType, string> = {
  SAN_5: 'Sân 5 người',
  SAN_7: 'Sân 7 người',
  SAN_11: 'Sân 11 người',
};

// Helper function to format date as YYYY-MM-DD in local timezone
const formatDateToLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const FieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [field, setField] = useState<Field | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingField, setIsLoadingField] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailedDialog, setShowFailedDialog] = useState(false);
  const [failedReason, setFailedReason] = useState<'expired' | 'failed' | 'cancelled'>('failed');

  // Booking store
  const {
    currentBooking,
    paymentStatus,
    startBooking,
    reset: resetBooking,
  } = useBookingStore();

  // Fetch field details
  useEffect(() => {
    const fetchField = async () => {
      if (!id) return;

      try {
        setIsLoadingField(true);
        const res = await fieldApi.getFieldById(Number(id));
        console.log(res);
        setField(res);
      } catch (error) {
        toast.error('Không thể tải thông tin sân');
        navigate('/fields');
      } finally {
        setIsLoadingField(false);
      }
    };

    fetchField();
  }, [id, navigate]);

  // Fetch slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id) return;

      try {
        setIsLoadingSlots(true);
        setSelectedSlot(null);
        const dateStr = formatDateToLocal(selectedDate);
        const res = await fieldApi.getSlots(Number(id), dateStr);
        console.log(res);
        setSlots(res);
      } catch (error) {
        toast.error('Không thể tải lịch ca');
        setSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [id, selectedDate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleBooking = async () => {
    if (!selectedSlot || !field) return;

    try {
      setIsBookingLoading(true);
      setSelectedSlot(null); // Close confirmation dialog

      const dateStr = formatDateToLocal(selectedDate);

      // Call API to lock slot and get payment info
      const response = await bookingApi.lockSlot({
        fieldId: field.id,
        slotId: selectedSlot.id,
        date: dateStr,
        price: selectedSlot.price
      });

      console.log(response);

      // If payment URL exists, redirect to payment page immediately
      if (response.paymentUrl) {
        // Store booking info before redirecting (for when user returns)
        startBooking(response);
        // Redirect to VNPay payment page
        window.location.href = response.paymentUrl;
        return;
      }

      // Fallback: open payment modal if no payment URL
      startBooking(response);

      // Refresh slots to show locked status
      const updatedSlots = await fieldApi.getSlots(field.id, dateStr);
      setSlots(updatedSlots);

    } catch (error: unknown) {
      console.error('Error locking slot:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể đặt sân';
      toast.error(errorMessage);
    } finally {
      setIsBookingLoading(false);
    }
  };

  // Watch for payment status changes
  useEffect(() => {
    if (paymentStatus === 'SUCCESS') {
      setShowSuccessDialog(true);
      resetBooking();
      // Refresh slots
      if (id) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        fieldApi.getSlots(Number(id), dateStr).then(setSlots);
      }
    } else if (paymentStatus === 'FAILED') {
      setFailedReason('failed');
      setShowFailedDialog(true);
      resetBooking();
    } else if (paymentStatus === 'EXPIRED') {
      setFailedReason('expired');
      setShowFailedDialog(true);
      resetBooking();
    }
  }, [paymentStatus, id, selectedDate, resetBooking]);

  const handleRetryBooking = () => {
    setShowFailedDialog(false);
    // User can select a slot again
  };

  if (isLoadingField) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 aspect-video bg-secondary rounded-lg animate-pulse" />
          <div className="h-80 bg-secondary rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!field) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/fields')}
          className="border-border hover:bg-secondary"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{field.name}</h1>
      </div>

      {/* Field Info Card */}
      <Card className="overflow-hidden bg-card border-border">
        <div className="aspect-[21/9] bg-secondary">
          {field.imageUrl ? (
            <img
              src={field.imageUrl}
              alt={field.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge className="bg-brand text-brand-foreground">
              {fieldTypeLabels[field.fieldType]}
            </Badge>
          </div>
          {field.description && (
            <p className="text-muted-foreground">{field.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Calendar & Slot Grid - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Calendar */}
        <Card className="bg-card border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Chọn ngày</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              className="rounded-lg border border-border"
            />
          </CardContent>
        </Card>

        {/* Right: Slot Grid */}
        <Card className="bg-card border-border lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-foreground">
              Lịch ca ngày {selectedDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSlots ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 bg-secondary rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <SlotGrid
                slots={slots}
                selectedSlotId={selectedSlot?.id ?? null}
                onSlotSelect={handleSlotSelect}
                isLoading={false}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!selectedSlot} onOpenChange={(open) => !open && setSelectedSlot(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Xác nhận đặt sân</DialogTitle>
            <DialogDescription>
              Vui lòng kiểm tra thông tin trước khi đặt sân
            </DialogDescription>
          </DialogHeader>

          {selectedSlot && (
            <div className="space-y-4">
              {/* Booking Info */}
              <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sân:</span>
                  <span className="font-semibold text-foreground">{field.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Loại sân:</span>
                  <Badge className="bg-brand text-brand-foreground">
                    {fieldTypeLabels[field.fieldType]}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngày:</span>
                  <span className="font-medium text-foreground">
                    {selectedDate.toLocaleDateString('vi-VN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ca đặt:</span>
                  <span className="font-medium text-foreground">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="border-t border-border pt-4">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-medium text-foreground">Tổng tiền:</span>
                  <span className="font-bold text-2xl text-brand">
                    {formatPrice(selectedSlot.price)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedSlot(null)}
              className="w-full sm:w-auto"
              disabled={isBookingLoading}
            >
              Chọn ca khác
            </Button>
            <Button
              className="w-full sm:w-auto bg-brand text-brand-foreground hover:bg-brand/90"
              onClick={handleBooking}
              disabled={isBookingLoading}
            >
              {isBookingLoading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đặt sân ngay
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <BookingSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        bookingInfo={currentBooking ? {
          fieldName: currentBooking.fieldName,
          date: new Date(currentBooking.date).toLocaleDateString('vi-VN'),
          slotTime: `${currentBooking.slotStartTime} - ${currentBooking.slotEndTime}`,
          totalPrice: currentBooking.totalPrice,
        } : undefined}
      />

      {/* Failed Dialog */}
      <BookingFailedDialog
        isOpen={showFailedDialog}
        onClose={() => setShowFailedDialog(false)}
        onRetry={handleRetryBooking}
        reason={failedReason}
      />
    </div>
  );
};

export default FieldDetailPage;
