import React, { useState } from 'react';
import type { Field, FieldType, CreateFieldRequest } from '../../types/type';
import { adminFieldApi } from '../../api/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface FieldFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFieldCreated: (field: Field) => void;
}

const fieldTypeOptions: { value: FieldType; label: string }[] = [
  { value: 'SAN_5', label: 'Sân 5 người' },
  { value: 'SAN_7', label: 'Sân 7 người' },
  { value: 'SAN_11', label: 'Sân 11 người' },
];

const FieldFormDialog: React.FC<FieldFormDialogProps> = ({
  open,
  onOpenChange,
  onFieldCreated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFieldRequest>({
    name: '',
    fieldType: 'SAN_5',
    description: '',
    imageUrl: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      fieldType: 'SAN_5',
      description: '',
      imageUrl: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên sân');
      return;
    }

    setIsLoading(true);
    try {
      const newField = await adminFieldApi.createField(formData);
      onFieldCreated(newField);
      resetForm();
      onOpenChange(false);
      toast.success('Thêm sân mới thành công');
    } catch (error) {
      toast.error('Không thể thêm sân mới');
      console.error('Error creating field:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thêm sân mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin sân bóng mới. Nhấn Lưu khi hoàn tất.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Tên sân <span className="text-destructive">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Sân A1"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Loại sân</label>
              <select
                value={formData.fieldType}
                onChange={(e) => setFormData({ ...formData, fieldType: e.target.value as FieldType })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                {fieldTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả ngắn về sân..."
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">URL ảnh</label>
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Đang lưu...' : 'Thêm sân'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldFormDialog;
