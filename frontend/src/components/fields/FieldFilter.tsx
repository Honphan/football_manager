import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { FieldType } from '../../types/type';

interface FieldFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedType: FieldType | null;
  onTypeChange: (type: FieldType | null) => void;
}

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: 'SAN_5', label: 'Sân 5' },
  { value: 'SAN_7', label: 'Sân 7' },
  { value: 'SAN_11', label: 'Sân 11' },
];

const FieldFilter: React.FC<FieldFilterProps> = ({
  searchValue,
  onSearchChange,
  selectedType,
  onTypeChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <Input
          type="text"
          placeholder="Tìm kiếm sân bóng..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border focus:border-brand focus:ring-brand"
        />
      </div>

      {/* Type Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={selectedType === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange(null)}
          className={
            selectedType === null
              ? 'bg-brand text-brand-foreground hover:bg-brand/90'
              : 'border-border hover:bg-secondary'
          }
        >
          Tất cả
        </Button>
        {fieldTypes.map((type) => (
          <Button
            key={type.value}
            variant={selectedType === type.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange(type.value)}
            className={
              selectedType === type.value
                ? 'bg-brand text-brand-foreground hover:bg-brand/90'
                : 'border-border hover:bg-secondary'
            }
          >
            {type.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FieldFilter;
