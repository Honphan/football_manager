import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Field, FieldType, FieldStatus, UpdateFieldRequest } from '../../types/type';
import { adminFieldApi } from '../../api/field';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../ui/sheet';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface AdminFieldSheetProps {
  field: Field | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFieldUpdated: (field: Field) => void;
  onFieldDeleted: (fieldId: number) => void;
}

const fieldTypeLabels: Record<FieldType, string> = {
  SAN_5: 'Sân 5',
  SAN_7: 'Sân 7',
  SAN_11: 'Sân 11',
};

const fieldTypeOptions: { value: FieldType; label: string }[] = [
  { value: 'SAN_5', label: 'Sân 5 người' },
  { value: 'SAN_7', label: 'Sân 7 người' },
  { value: 'SAN_11', label: 'Sân 11 người' },
];

const AdminFieldSheet: React.FC<AdminFieldSheetProps> = ({
  field,
  open,
  onOpenChange,
  onFieldUpdated,
}) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<UpdateFieldRequest>({});

  // Reset form when field changes
  React.useEffect(() => {
    if (field) {
      setFormData({
        name: field.name,
        fieldType: field.fieldType,
        description: field.description || '',
        imageUrl: field.imageUrl || '',
      });
      setIsEditing(false);
    }
  }, [field]);

  const handleSave = async () => {
    if (!field) return;

    setIsLoading(true);
    try {
      const updatedField = await adminFieldApi.updateField(field.id, formData);
      onFieldUpdated(updatedField);
      setIsEditing(false);
      toast.success('Cập nhật sân thành công');
    } catch (error) {
      toast.error('Không thể cập nhật sân');
      console.error('Error updating field:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!field) return;

    setIsLoading(true);
    try {
      const newStatus: FieldStatus = field.status === 'MAINTENANCE' ? 'AVAILABLE' : 'MAINTENANCE';
      const updatedField = await adminFieldApi.updateFieldStatus(field.id, newStatus);
      onFieldUpdated(updatedField);
      toast.success(newStatus === 'MAINTENANCE' ? 'Đã khóa sân để bảo trì' : 'Đã mở khóa sân');
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái sân');
      console.error('Error updating field status:', error);
    } finally {
      setIsLoading(false);
    }
  };



  if (!field) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {isEditing ? 'Chỉnh sửa sân' : field.name}
              {!isEditing && (
                <Badge
                  className={
                    field.status === 'AVAILABLE'
                      ? 'bg-green text-white'
                      : field.status === 'MAINTENANCE'
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-muted text-muted-foreground'
                  }
                >
                  {field.status === 'AVAILABLE' ? 'Hoạt động' : 'Bảo trì'}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              {isEditing ? 'Cập nhật thông tin sân bóng' : fieldTypeLabels[field.fieldType]}
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            {/* Field Image */}
            {!isEditing && field.imageUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary">
                <img
                  src={field.imageUrl}
                  alt={field.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tên sân</label>
                {isEditing ? (
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nhập tên sân"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">{field.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Loại sân</label>
                {isEditing ? (
                  <select
                    value={formData.fieldType || field.fieldType}
                    onChange={(e) => setFormData({ ...formData, fieldType: e.target.value as FieldType })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {fieldTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-muted-foreground">{fieldTypeLabels[field.fieldType]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mô tả</label>
                {isEditing ? (
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả sân"
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {field.description || 'Không có mô tả'}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">URL ảnh</label>
                  <Input
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isEditing && (
              <div className="space-y-3">
                <Button
                  variant="default"
                  className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                  onClick={() => {
                    onOpenChange(false);
                    navigate(`/admin/fields/${field.id}`);
                  }}
                  disabled={isLoading}
                >
                  📅 Quản lý ca đặt
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleToggleMaintenance}
                  disabled={isLoading}
                >
                  {field.status === 'MAINTENANCE' ? '🔓 Mở khóa sân' : '🔒 Khóa sân bảo trì'}
                </Button>
              </div>
            )}
          </div>

          <SheetFooter className="gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Hủy
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="w-full">
                ✏️ Chỉnh sửa
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminFieldSheet;
