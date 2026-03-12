1. Lịch sử Booking của User (My Bookings)
Mục tiêu là giúp người dùng xem lại các sân mình đã đặt, trạng thái thanh toán và thông tin chi tiết.

Backend:

API: GET /api/bookings/my-bookings

Logic: Query bảng bookings theo userId (lấy từ JWT).
Data trả về: Ngày đặt, tên sân, khung giờ, tổng tiền, trạng thái (PENDING, CONFIRMED, CANCELLED).

Frontend:

UI: Một Table hoặc danh sách dạng Card.

Badge: Hiển thị màu sắc theo trạng thái (Xanh: Thành công, Vàng: Chờ, Đỏ: Đã hủy).

2. Trang chủ User (Dashboard & Personal Info)
Phần này giúp cá nhân hóa trải nghiệm và thống kê nhanh cho người dùng.

Thông tin cá nhân & Thống kê
Backend: * API: GET /api/users/profile/summary

Logic: * Lấy thông tin cơ bản: Tên, Email, Số điện thoại.

Thống kê: SELECT count(*) FROM bookings WHERE user_id = :id AND status = 'CONFIRMED'.

Frontend:

Thiết kế dạng Dashboard:

Card 1: Tổng số trận đã đặt (Số sân đã đặt).

Card 2: Trận đấu sắp tới (Booking gần nhất ở trạng thái CONFIRMED).

Profile Section: Cho phép người dùng cập nhật SĐT (vì Admin cần SĐT để liên hệ).

3. Danh sách Booking cho Admin (Admin Management)
Đây là "đài chỉ huy" để chủ sân theo dõi lịch trình hàng ngày.

Backend:

API: GET /api/admin/bookings cần pagination vì lịch sử sẽ dài

Filter (Quan trọng): Phải cho phép lọc theo date (mặc định là hôm nay), lọc theo fieldId, và tìm kiếm theo phone của khách.

SQL Logic: Cần JOIN bảng bookings với bảng users để lấy được full_name và phone_number.

SQL
SELECT b.id, u.full_name, u.phone_number, f.name as field_name, 
       ts.start_time, ts.end_time, b.status, b.booking_date
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN field_slots fs ON b.field_slot_id = fs.id
JOIN fields f ON fs.field_id = f.id
JOIN time_slots ts ON fs.time_slot_id = ts.id
ORDER BY b.booking_date DESC, ts.start_time ASC
Frontend:

Admin Table: Hiển thị đầy đủ cột thông tin người đặt.

Tính năng bổ sung: Nút "Hủy đơn" hoặc "Xác nhận bằng tay" (nếu khách trả tiền mặt tại sân).