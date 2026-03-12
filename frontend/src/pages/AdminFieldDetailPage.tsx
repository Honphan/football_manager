import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fieldApi } from '../api/field';
import type { Field, TimeSlot, FieldType } from '../types/type';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import AdminSlotTable from '../components/admin/AdminSlotTable';
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

const AdminFieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [field, setField] = useState<Field | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isLoadingField, setIsLoadingField] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Fetch field details
  useEffect(() => {
    const fetchField = async () => {
      if (!id) return;

      try {
        setIsLoadingField(true);
        const res = await fieldApi.getFieldById(Number(id));
        setField(res);
      } catch (error) {
        toast.error('Không thể tải thông tin sân');
        navigate('/admin/fields');
      } finally {
        setIsLoadingField(false);
      }
    };

    fetchField();
  }, [id, navigate]);

  // Fetch slots function
  const fetchSlots = async () => {
    if (!id) return;

    try {
      setIsLoadingSlots(true);
      const dateStr = formatDateToLocal(selectedDate);
      const res = await fieldApi.getSlots(Number(id), dateStr);
      setSlots(res);
    } catch (error) {
      toast.error('Không thể tải lịch ca');
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Fetch slots when date changes
  useEffect(() => {
    fetchSlots();
  }, [id, selectedDate]);

  const getDateString = () => {
    return formatDateToLocal(selectedDate);
  };

  if (isLoadingField) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-secondary rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-secondary rounded-lg animate-pulse" />
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/fields')}
          className="border-border hover:bg-secondary"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{field.name}</h1>
          <Badge
            className={
              field.status === 'AVAILABLE'
                ? 'bg-green text-white'
                : 'bg-destructive text-destructive-foreground'
            }
          >
            {field.status === 'AVAILABLE' ? 'Hoạt động' : 'Bảo trì'}
          </Badge>
          <Badge className="bg-brand text-brand-foreground">
            {fieldTypeLabels[field.fieldType]}
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Calendar */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground text-lg">Chọn ngày</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-lg border border-border"
            />
          </CardContent>
        </Card>

        {/* Right: Slot Table */}
        <div className="lg:col-span-3">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground">
                  Quản lý ca - {selectedDate.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {slots.length} ca / ngày
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <AdminSlotTable
                slots={slots}
                fieldId={field.id}
                date={getDateString()}
                onRefresh={fetchSlots}
                isLoading={isLoadingSlots}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminFieldDetailPage;
