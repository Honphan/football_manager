import React, { useState, useEffect, useMemo } from 'react';
import { fieldApi } from '../api/field';
import type { Field, FieldType } from '../types/type';
import FieldCard from '../components/fields/FieldCard';
import FieldFilter from '../components/fields/FieldFilter';
import { toast } from 'sonner';

const FieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedType, setSelectedType] = useState<FieldType | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setIsLoading(true);
        const data = await fieldApi.getFields();
        console.log("ok");
        console.log(data);
        setFields(data);
      } catch (error) {
        toast.error('Không thể tải danh sách sân bóng');
        console.error('Error fetching fields:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFields();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Danh sách sân bóng</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Chọn sân bạn muốn đặt
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredFields.length} sân
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
          <p className="text-muted-foreground text-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFields.map((field) => (
            <FieldCard key={field.id} field={field} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FieldsPage;
