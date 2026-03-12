import React, { useState } from 'react';
import type { TimeSlot, SlotStatus } from '../../types/type';
import { adminFieldApi } from '../../api/field';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface AdminSlotTableProps {
  slots: TimeSlot[];
  fieldId: number;
  date: string;
  onRefresh: () => void;
  isLoading?: boolean;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

const getStatusBadge = (status: SlotStatus) => {
  switch (status) {
    case 'AVAILABLE':
      return <Badge className="bg-green text-white">Có thể đặt</Badge>;
    case 'LOCKED':
      return <Badge className="bg-yellow-500 text-white">Đã khóa</Badge>;
    case 'BOOKED':
      return <Badge className="bg-brand text-brand-foreground">Đã đặt</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const AdminSlotTable: React.FC<AdminSlotTableProps> = ({
  slots,
  fieldId,
  date,
  onRefresh,
  isLoading = false,
}) => {
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditPrice = (slot: TimeSlot) => {
    setEditingSlotId(slot.id);
    setEditPrice(slot.price.toString());
  };

  const handleSavePrice = async (slot: TimeSlot) => {
    const newPrice = parseInt(editPrice, 10);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error('Giá không hợp lệ');
      return;
    }

    setIsUpdating(true);
    try {
      await adminFieldApi.updateSlot(fieldId, slot.slotId, date, { price: newPrice });
      setEditingSlotId(null);
      toast.success('Cập nhật giá thành công');
      onRefresh();
    } catch (error) {
      toast.error('Không thể cập nhật giá');
      console.error('Error updating slot price:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlotId(null);
    setEditPrice('');
  };



  if (isLoading) {
    return (
      <div className="rounded-md border border-border overflow-hidden">
        {/* Skeleton Header */}
        <div className="bg-muted/50 border-b border-border">
          <div className="flex items-center h-12 px-4 gap-4">
            <div className="w-12 h-4 bg-secondary rounded animate-pulse" />
            <div className="w-24 h-4 bg-secondary rounded animate-pulse" />
            <div className="w-20 h-4 bg-secondary rounded animate-pulse" />
            <div className="w-20 h-4 bg-secondary rounded animate-pulse" />
            <div className="flex-1" />
            <div className="w-32 h-4 bg-secondary rounded animate-pulse" />
          </div>
        </div>
        {/* Skeleton Rows */}
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center h-14 px-4 gap-4">
              <div className="w-8 h-4 bg-secondary rounded animate-pulse" />
              <div className="w-28 h-4 bg-secondary rounded animate-pulse" />
              <div className="w-24 h-4 bg-secondary rounded animate-pulse" />
              <div className="w-20 h-6 bg-secondary rounded-full animate-pulse" />
              <div className="flex-1" />
              <div className="flex gap-2">
                <div className="w-16 h-8 bg-secondary rounded animate-pulse" />
                <div className="w-16 h-8 bg-secondary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có dữ liệu ca cho ngày này
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Ca</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Giá</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slots.map((slot) => (
            <TableRow key={slot.id}>
              <TableCell className="font-medium">{slot.slotId}</TableCell>
              <TableCell>
                {slot.startTime} - {slot.endTime}
              </TableCell>
              <TableCell>
                {editingSlotId === slot.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-28 h-8"
                      min="0"
                    />
                    <span className="text-xs text-muted-foreground">VNĐ</span>
                  </div>
                ) : (
                  <span className="font-medium">{formatPrice(slot.price)}</span>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(slot.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {editingSlotId === slot.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        Hủy
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSavePrice(slot)}
                        disabled={isUpdating}
                      >
                        Lưu
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPrice(slot)}
                      disabled={isUpdating || slot.status === 'BOOKED'}
                    >
                      Sửa giá
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminSlotTable;
