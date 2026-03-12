
GIAI ĐOẠN 1: AUTHENTICATION (BẢO MẬT & ĐĂNG NHẬP)
Mục tiêu: Đưa người dùng và admin vào đúng "vị trí" của mình.

1.1 Cho User (Người dùng)
Đăng ký (Signup): Form thu thập: Họ tên, Số điện thoại (dùng làm username), Mật khẩu.

Đăng nhập (Login): Xác thực và lưu JWT vào Zustand vì backend dùng httpOnly Cookie.

refreshToken: Khi accessToken hết hạn (401 Error):

Frontend tự động gọi API /refresh (với withCredentials: true).

Backend đọc refreshToken từ Cookie, nếu hợp lệ thì cấp accessToken mới.


Luồng xử lý: Sau khi login, redirect về trang Danh sách sân.

1.2 Cho Admin (Quản trị viên)
Đăng nhập Admin: Một trang login riêng biệt (hoặc cùng trang nhưng phân quyền) để vào Dashboard.

Phân quyền (RBAC): Sử dụng PrivateRoutes để chặn người dùng thường vào trang quản lý.

 GIAI ĐOẠN 2: USER EXPERIENCE (TRẢI NGHIỆM ĐẶT SÂN)
Đây là "trái tim" của hệ thống, nơi User tương tác với sân bóng.

2.1 Xem & Chọn sân (Fields)
Giao diện: Card view hiện hình ảnh sân, loại sân (5/7/11) và giá tiền.

Tìm kiếm: Bộ lọc đơn giản theo tên sân hoặc loại sân.

2.2 Đặt sân (Booking - Logic 11 ca)
Chọn ngày: Dùng Calendar của shadcn/ui.

Lưới ca (Slot Grid): * Hiển thị 11 ô ca tương ứng dữ liệu từ Backend.

Logic màu sắc: Xanh (available), Cam (locked), Đỏ (booked).

Giữ chỗ (The 10-min Timer): * Khi User nhấn đặt -> Hiện Popup xác nhận.

Nếu Backend trả về LOCKED thành công -> Hiện đồng hồ đếm ngược 10:00.

 GIAI ĐOẠN 3: USER HISTORY (LỊCH SỬ CỦA TÔI)
Trang cá nhân: Nơi user xem lại các đơn đã đặt.

Bảng lịch sử: Hiển thị: Ngày đặt, Sân, Ca, Tổng tiền, Trạng thái (Chờ thanh toán / Đã xác nhận / Đã hủy).

 GIAI ĐOẠN 4: ADMIN MANAGEMENT (QUẢN LÝ TOÀN DIỆN)
Trang dành riêng cho "Sếp" điều hành hệ thống.

4.1 Tổng quan (Dashboard)
Thống kê nhanh: Tổng doanh thu, Số ca đã đặt trong ngày, Số khách mới.

4.2 Quản lý Đơn hàng (Master Booking Manager)
Duyệt đơn: Xem danh sách tất cả các đơn LOCKED hoặc PENDING.

Xác nhận: Admin nhấn "Xác nhận đã nhận tiền" để chuyển trạng thái đơn sang CONFIRMED.

Hủy đơn: Quyền hủy các đơn quá hạn hoặc có sự cố.

4.3 Quản lý Sân (Field CRUD)
Danh sách: Chỉnh sửa thông tin sân, giá cả, hoặc tạm đóng cửa sân để bảo trì.