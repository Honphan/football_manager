import React from 'react';
import type { Field, FieldType } from '../../types/type';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

interface AdminFieldCardProps {
  field: Field;
  onClick: () => void;
}

const fieldTypeLabels: Record<FieldType, string> = {
  SAN_5: 'Sân 5',
  SAN_7: 'Sân 7',
  SAN_11: 'Sân 11',
};

const AdminFieldCard: React.FC<AdminFieldCardProps> = ({ field, onClick }) => {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brand/50 bg-card border-border"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-secondary">
        {field.imageUrl ? (
          <img
            src={field.imageUrl}
            alt={field.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        <Badge
          className={`absolute top-3 right-3 ${field.status === 'AVAILABLE'
              ? 'bg-green text-white'
              : field.status === 'MAINTENANCE'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
        >
          {field.status === 'AVAILABLE' ? 'Hoạt động' : field.status === 'MAINTENANCE' ? 'Bảo trì' : field.status}
        </Badge>

        {/* Field Type Badge */}
        <Badge className="absolute top-3 left-3 bg-brand text-brand-foreground hover:bg-brand/90">
          {fieldTypeLabels[field.fieldType]}
        </Badge>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1 group-hover:text-brand transition-colors">
          {field.name}
        </h3>

        {field.description && (
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {field.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>ID: {field.id}</span>
          <span className="text-brand">Click để quản lý →</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminFieldCard;
