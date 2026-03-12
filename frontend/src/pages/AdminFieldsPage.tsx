import React, { useState, useEffect, useMemo } from 'react';
import { fieldApi } from '../api/field';
import type { Field, FieldType } from '../types/type';
import AdminFieldCard from '../components/admin/AdminFieldCard';
import AdminFieldSheet from '../components/admin/AdminFieldSheet';
import FieldFormDialog from '../components/admin/FieldFormDialog';
import FieldFilter from '../components/fields/FieldFilter';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const AdminFieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);

  // Sheet state
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Dialog state
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      setIsLoading(true);
      const data = await fieldApi.getFields();
      setFields(data);
    } catch (error) {
      toast.error('Không thể tải danh sách sân bóng');
      console.error('Error fetching fields:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter fields based on search and type
  const filteredFields = useMemo(() => {
    return fields.filter((field) => {
      const matchesSearch = field.name
        .toLowerCase()
        .includes(searchValue.toLowerCase());
      const matchesType = selectedType === null || field.fieldType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [fields, searchValue, selectedType]);

  const handleFieldClick = (field: Field) => {
    setSelectedField(field);
    setIsSheetOpen(true);
  };

  const handleFieldUpdated = (updatedField: Field) => {
    setFields((prev) =>
      prev.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
    setSelectedField(updatedField);
  };

  const handleFieldDeleted = (fieldId: number) => {
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const handleFieldCreated = (newField: Field) => {
    setFields((prev) => [newField, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quản lý sân bóng</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Thêm, sửa, xóa và quản lý trạng thái các sân
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {filteredFields.length} sân
          </span>
          <Button onClick={() => setIsFormDialogOpen(true)}>
            + Thêm sân mới
          </Button>
        </div>
      </div>

      {/* Filter */}
      <FieldFilter
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* Fields Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-4/3 rounded-lg bg-secondary animate-pulse"
            />
          ))}
        </div>
      ) : filteredFields.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Không tìm thấy sân nào
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Thử thay đổi bộ lọc hoặc thêm sân mới
          </p>
          <Button onClick={() => setIsFormDialogOpen(true)}>
            + Thêm sân đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFields.map((field) => (
            <AdminFieldCard
              key={field.id}
              field={field}
              onClick={() => handleFieldClick(field)}
            />
          ))}
        </div>
      )}

      {/* Field Detail Sheet */}
      <AdminFieldSheet
        field={selectedField}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onFieldUpdated={handleFieldUpdated}
        onFieldDeleted={handleFieldDeleted}
      />

      {/* Add Field Dialog */}
      <FieldFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        onFieldCreated={handleFieldCreated}
      />
    </div>
  );
};

export default AdminFieldsPage;
