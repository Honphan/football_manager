import React from 'react';
import type { TimeSlot, SlotStatus } from '../../types/type';
import { cn } from '../../lib/utils';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlotId: number | null;
  onSlotSelect: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

const slotStatusStyles: Record<SlotStatus, { bg: string; border: string; text: string; label: string }> = {
  AVAILABLE: {
    bg: 'bg-green/20 hover:bg-green/30',
    border: 'border-green',
    text: 'text-green',
    label: 'Còn trống',
  },
  LOCKED: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500',
    text: 'text-amber-600',
    label: 'Đang giữ',
  },
  BOOKED: {
    bg: 'bg-destructive/20',
    border: 'border-destructive',
    text: 'text-destructive',
    label: 'Đã đặt',
  },
};

const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  selectedSlotId,
  onSlotSelect,
  isLoading = false,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 11 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-secondary animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>Chưa có ca nào cho ngày này</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(slotStatusStyles).map(([status, styles]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={cn('w-4 h-4 rounded border-2', styles.bg, styles.border)} />
            <span className="text-muted-foreground">{styles.label}</span>
          </div>
        ))}
      </div>

      {/* Slot Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {slots.map((slot, index) => {
          const styles = slotStatusStyles[slot.status];
          const isAvailable = slot.status === 'AVAILABLE';
          const isSelected = selectedSlotId === slot.id;

          return (
            <button
              key={index}
              onClick={() => isAvailable && onSlotSelect(slot)}
              disabled={!isAvailable}
              className={cn(
                'p-3 rounded-lg border-2 text-left transition-all duration-200',
                styles.bg,
                styles.border,
                isAvailable && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
                !isAvailable && 'cursor-not-allowed opacity-70',
                isSelected && 'ring-2 ring-brand ring-offset-2 ring-offset-background'
              )}
            >
              {/* Slot Number */}
              <div className={cn('font-bold text-lg', styles.text)}>
                Ca {index + 1}
              </div>

              {/* Time Range */}
              <div className="text-foreground text-sm font-medium mt-1">
                {slot.startTime} - {slot.endTime}
              </div>

              {/* Price */}
              <div className="text-muted-foreground text-xs mt-2">
                {formatPrice(slot.price)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SlotGrid;
