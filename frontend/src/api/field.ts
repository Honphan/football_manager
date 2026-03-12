import apiClient from './client';
import type {
  Field,
  TimeSlot,
  CreateFieldRequest,
  UpdateFieldRequest,
  UpdateSlotRequest,
  FieldStatus,
  SlotStatus
} from '../types/type';

export interface FieldSearchParams {
  name?: string;
  type?: string;
}

export const fieldApi = {
  /**
   * Lấy danh sách tất cả sân bóng
   * @param params - Bộ lọc tìm kiếm (name, type)
   */
  getFields: async (): Promise<Field[]> => {
    const response = await apiClient.get('/fields');
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết của một sân
   * @param id - ID của sân
   */
  getFieldById: async (id: number): Promise<Field> => {
    const response = await apiClient.get<Field>(`/fields/${id}`);
    return response.data;
  },

  /**
   * Lấy danh sách 11 ca trong ngày của một sân
   * @param fieldId - ID của sân
   * @param date - Ngày cần xem (format: YYYY-MM-DD)
   */
  getSlots: async (fieldId: number, date: string): Promise<TimeSlot[]> => {
    const response = await apiClient.get<TimeSlot[]>(`/fields/${fieldId}/slots`, {
      params: { date }
    });
    return response.data;
  },
};

// ============ Admin API ============
export const adminFieldApi = {
  /**
   * Tạo sân mới
   */
  createField: async (data: CreateFieldRequest): Promise<Field> => {
    const response = await apiClient.post<Field>('/admin/fields', data);
    return response.data;
  },

  /**
   * Cập nhật thông tin sân
   */
  updateField: async (id: number, data: UpdateFieldRequest): Promise<Field> => {
    const response = await apiClient.put<Field>(`/admin/fields/${id}`, data);
    return response.data;
  },

  /**
   * Xóa sân
   */
  deleteField: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/fields/${id}`);
  },

  /**
   * Cập nhật trạng thái sân (Active/Maintenance)
   */
  updateFieldStatus: async (id: number, status: FieldStatus): Promise<Field> => {
    const response = await apiClient.patch<Field>(`/admin/fields/${id}/status`, { status });
    return response.data;
  },

  /**
   * Cập nhật giá cho 1 slot (có thể theo ngày cụ thể)
   */
  updateSlotPrice: async (slotId: number, price: number, date?: string): Promise<TimeSlot> => {
    const response = await apiClient.patch<TimeSlot>(`/admin/slots/${slotId}/price`, {
      price,
      date
    });
    return response.data;
  },

  /**
   * Khóa/Mở khóa slot
   */
  updateSlotStatus: async (slotId: number, status: SlotStatus): Promise<TimeSlot> => {
    const response = await apiClient.patch<TimeSlot>(`/admin/slots/${slotId}/status`, { status });
    return response.data;
  },

  /**
   * Cập nhật slot cho 1 ngày cụ thể (giá + status)
   */
  updateSlot: async (fieldId: number, slotId: number, date: string, data: UpdateSlotRequest): Promise<TimeSlot> => {
    const response = await apiClient.patch<TimeSlot>(`/admin/fields/${fieldId}/slots/${slotId}`, {
      ...data,
      date
    });
    return response.data;
  },
};
