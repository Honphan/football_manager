CREATE DATABASE IF NOT EXISTS footballmanager;
USE footballmanager;


-- 1. Xóa status ở bảng time_slots
ALTER TABLE time_slots DROP COLUMN status;
ALTER TABLE field_slots DROP COLUMN status;


-- 2. Thêm status vào bảng field_slots
ALTER TABLE field_slots 
ADD COLUMN status ENUM('AVAILABLE', 'LOCKED', 'BOOKED') 
NOT NULL DEFAULT 'AVAILABLE';


ALTER TABLE bookings 
ADD COLUMN payment_method VARCHAR(20) DEFAULT 'VNPAY',
ADD COLUMN payment_date TIMESTAMP NULL;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS booking_services;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS field_slot_prices; -- Bảng gộp quản lý giá
DROP TABLE IF EXISTS field_slots;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS fields;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. BẢNG QUYỀN TRUY CẬP
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name ENUM('ROLE_USER', 'ROLE_ADMIN', 'ROLE_STAFF') DEFAULT 'ROLE_USER'
);

-- 2. BẢNG NGƯỜI DÙNG
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(15) NOT NULL,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. BẢNG SÂN BÓNG 
-- (Đã gộp fieldType và Description theo yêu cầu)
CREATE TABLE fields (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL, -- Ví dụ: Sân A1, Sân B2
    field_type ENUM('SAN_5', 'SAN_7', 'SAN_11') NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    status ENUM('AVAILABLE', 'MAINTENANCE', 'BUSY') DEFAULT 'AVAILABLE'
);

-- 4. BẢNG DANH MỤC CA (TIME SLOTS)
-- Chỉ lưu khung giờ gốc của hệ thống
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slot_name VARCHAR(20), -- Ca 1, Ca 2...
    start_time TIME NOT NULL, 
    end_time TIME NOT NULL
);

-- 5. BẢNG LIÊN KẾT SÂN VÀ CA (FIELD SLOTS)
-- Xác định sân nào có những ca nào và giá mặc định cho ca đó
CREATE TABLE field_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    field_id INT,
    time_slot_id INT,
    default_price DECIMAL(12, 2) NOT NULL, -- Giá gốc áp dụng nếu không có chỉnh sửa
    FOREIGN KEY (field_id) REFERENCES fields(id),
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id),
    CONSTRAINT unique_field_slot UNIQUE (field_id, time_slot_id)
);

-- 6. BẢNG QUẢN LÝ GIÁ BIẾN ĐỘNG (GỘP THEO DATE VÀ DAY)
-- Dùng để chỉnh giá theo thứ (2-8) hoặc theo ngày cụ thể (Lễ, Tết)
CREATE TABLE field_slot_prices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    field_slot_id INT,
    price_type ENUM('WEEKDAY', 'SPECIFIC_DATE') NOT NULL, -- Phân biệt loại chỉnh giá
    day_of_week INT NULL, -- Lưu từ 2-8 (Thứ 2 đến Chủ Nhật)
    specific_date DATE NULL, -- Lưu ngày cụ thể (ví dụ: 2026-01-01)
    price DECIMAL(12, 2) NOT NULL,
    description VARCHAR(255), -- Ghi chú: "Giá cuối tuần", "Giá Tết Dương Lịch"
    FOREIGN KEY (field_slot_id) REFERENCES field_slots(id),
    -- Đảm bảo không trùng lặp cấu hình cho cùng một loại
    CONSTRAINT unique_price_config UNIQUE (field_slot_id, price_type, day_of_week, specific_date)
);

-- 7. BẢNG ĐẶT SÂN
CREATE TABLE bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    field_slot_id INT,
    booking_date DATE NOT NULL,
    actual_price DECIMAL(12, 2), -- Lưu giá tại thời điểm khách đặt
    total_amount DECIMAL(12, 2), 
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    payment_status ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (field_slot_id) REFERENCES field_slots(id),
    -- Chống đặt trùng: 1 sân vào 1 ca trong 1 ngày chỉ có 1 người đặt
    CONSTRAINT unique_booking UNIQUE (field_slot_id, booking_date)
);

-- 8. BẢNG THANH TOÁN
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    booking_id BIGINT,
    payment_method ENUM('CASH', 'VNPAY', 'MOMO', 'BANK_TRANSFER'),
    transaction_id VARCHAR(100),
    amount DECIMAL(12, 2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- 9. BẢNG DỊCH VỤ (NƯỚC UỐNG, ĐỒ THUÊ)
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    unit_price DECIMAL(12, 2),
    stock INT
);

-- 10. BẢNG CHI TIẾT DỊCH VỤ ĐI KÈM ĐƠN ĐẶT
CREATE TABLE booking_services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT, 
    booking_id BIGINT NOT NULL,
    service_id INT NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12, 2),
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);



-- ==========================================
-- DỮ LIỆU MẪU ĐỂ TEST
-- ==========================================

INSERT INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_USER');

INSERT INTO fields (name, field_type, description) VALUES 
('Sân A1', 'SAN_5', 'Sân gần cửa ra vào, cỏ mới'),
('Sân B1', 'SAN_7', 'Sân tiêu chuẩn thi đấu');

INSERT INTO time_slots (slot_name, start_time, end_time) VALUES 
('Ca 1', '17:30:00', '19:00:00'),
('Ca 2', '19:00:00', '20:30:00');

-- Liên kết Sân A1 với Ca 1 và giá gốc 300k
INSERT INTO field_slots (field_id, time_slot_id, default_price) VALUES (1, 1, 300000);

-- Ví dụ 1: Chỉnh giá Sân A1 - Ca 1 vào ngày Chủ Nhật (Số 8) lên 400k
INSERT INTO field_slot_prices (field_slot_id, price_type, day_of_week, price, description) 
VALUES (1, 'WEEKDAY', 8, 400000, 'Giá mặc định Chủ Nhật');

-- Ví dụ 2: Chỉnh giá Sân A1 - Ca 1 vào ngày Quốc Khánh 02/09/2026 lên 600k
INSERT INTO field_slot_prices (field_slot_id, price_type, specific_date, price, description) 
VALUES (1, 'SPECIFIC_DATE', '2026-09-02', 600000, 'Giá ngày lễ Quốc Khánh');