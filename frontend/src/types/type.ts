export const UserRole = {
    USER: 'ROLE_USER',
    ADMIN: 'ROLE_ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export interface LoginResponse {
    accessToken: string;
    username: string;
    role: UserRole;
}

export interface User {
    id: number;
    username: string;
    role: UserRole;
}

export interface AuthState {
    username: string | null;
    role: UserRole | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (username: string, role: UserRole, accessToken: string) => void;
    clearAuth: () => void;
    setLoading: (isLoading: boolean) => void;
}

// ============ Stage 2: Field & Booking Types ============

// Field Types (sync với Backend Enum)
export const FieldType = {
    SAN_5: 'SAN_5',
    SAN_7: 'SAN_7',
    SAN_11: 'SAN_11',
} as const;

export const FieldStatus = {
    AVAILABLE: 'AVAILABLE',
    MAINTENANCE: 'MAINTENANCE',
    BUSY: 'BUSY',
} as const;

export type FieldStatus = (typeof FieldStatus)[keyof typeof FieldStatus];

export type FieldType = (typeof FieldType)[keyof typeof FieldType];

export interface Field {
    id: number;
    name: string;
    fieldType: FieldType;
    imageUrl: string;
    status: FieldStatus;
    description?: string;
}

// Slot Status (sync với Backend)
export const SlotStatus = {
    AVAILABLE: 'AVAILABLE',
    LOCKED: 'LOCKED',
    BOOKED: 'BOOKED',
} as const;

export type SlotStatus = (typeof SlotStatus)[keyof typeof SlotStatus];

// Time Slot (1 trong 11 ca/ngày)
export interface TimeSlot {
    id: number;
    slotId: number;
    startTime: string;  // "06:00"
    endTime: string;    // "07:30"
    price: number;
    status: SlotStatus;
}

// Booking Status
export const BookingStatus = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    CANCELLED: 'CANCELLED',
    COMPLETED: 'COMPLETED',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// Booking
export interface Booking {
    id: number;
    fieldId: number;
    fieldName: string;
    slotId: number;
    slotNumber: number;
    date: string;
    status: BookingStatus;
    totalPrice: number;
    createdAt: string;
}

// ============ Stage 3: Admin Types ============

// Request types for admin operations
export interface CreateFieldRequest {
    name: string;
    fieldType: FieldType;
    description?: string;
    imageUrl?: string;
}

export interface UpdateFieldRequest {
    name?: string;
    fieldType?: FieldType;
    description?: string;
    imageUrl?: string;
    status?: FieldStatus;
}

export interface UpdateSlotRequest {
    price?: number;
    status?: SlotStatus;
}

export interface GlobalSlotSettingsRequest {
    firstStartTime: string; // "06:00"
}

export interface BulkPriceUpdateRequest {
    fieldType: FieldType;
    percentage?: number;  // +10 or -5
    fixedPrice?: number;  // OR set fixed price
}

// ============ Stage 4: Booking Flow Types ============

// Payment Status for booking flow
export const PaymentStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    EXPIRED: 'EXPIRED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// Request to lock a slot for booking
export interface LockSlotRequest {
    fieldId: number;
    slotId: number;
    date: string; // "2026-01-27"
    price: number;
}

// Response from lock slot API - contains payment info
export interface LockSlotResponse {
    bookingId: number;
    paymentUrl: string;      // VNPay payment URL
    expiresAt: string;       // ISO timestamp when lock expires
    totalPrice: number;
    fieldName: string;
    slotStartTime: string;
    slotEndTime: string;
    date: string;
    qrCodeUrl?: string
}

// Response from booking status check API
export interface BookingStatusResponse {
    bookingId: number;
    paymentStatus: PaymentStatus;
    bookingStatus: BookingStatus;
    message?: string;
}

// Cancel booking request
export interface CancelBookingRequest {
    bookingId: number;
    reason?: string;
}


export interface PaymentInfo {
    bookingId: number;
    paymentUrl: string;
}

// ============ Stage 5: Booking History Types ============

// User booking history item (matches backend BookingResponse)
export interface UserBooking {
    id: number;
    fieldName: string;
    fieldImageUrl: string | null;
    slotName: string;
    timeRange: string;        // "17:30 - 19:00"
    bookingDate: string;      // "2026-01-30"
    totalAmount: number;
    status: BookingStatus;    // CONFIRMED, CANCELLED, PENDING
    createdAt: string;
}

// User profile summary with stats
export interface UserProfileSummary {
    username: string;
    email: string;
    phoneNumber: string | null;
    totalBookings: number;
    upcomingBooking: UserBooking | null;
}

// Update phone request
export interface UpdatePhoneRequest {
    phoneNumber: string;
}

// Admin booking item (includes user info)
export interface AdminBooking {
    id: number;
    username: string;
    customerPhone: string | null;
    fieldName: string;
    fieldType: FieldType;
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    status: BookingStatus;
    createdAt: string;
}

// Admin booking filter params
export interface AdminBookingFilter {
    date?: string;
    fieldId?: number;
    phone?: string;
    status?: BookingStatus;
    page?: number;
    size?: number;
}

// Pagination response wrapper
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
}
