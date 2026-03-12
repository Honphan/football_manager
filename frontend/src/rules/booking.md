
# Frontend Development Plan: Court Booking System

## 1. Workflow Tổng quan
1. **Chọn sân:** User chọn sân và khung giờ.
2. **Khởi tạo đơn hàng:** Click "Đặt ngay" -> Gọi API Backend để khóa sân và lấy thông tin thanh toán.
3. **Thanh toán:** Hiển thị Modal/Page chứa QR VNPay và đồng hồ đếm ngược (10:00).
4. **Xác nhận:** Nhận thông báo từ Backend (thông qua Webhook/Socket hoặc Polling) và hiển thị kết quả.

## 2. Các Component cần xây dựng
- `BookingCalendar`: Hiển thị danh sách sân và trạng thái (Trống, Đang chờ, Đã đặt).
- `PaymentModal`: 
    - Hiển thị QR Code VNPay.
    - Countdown Timer (10 phút).
    - Nút "Hủy giao dịch".
- `BookingStatus`: Thông báo thành công/thất bại sau khi thanh toán.

## 3. Quản lý State & Logic
- **Locking State:** Khi Backend trả về mã khóa, Frontend chuyển UI sân đó sang trạng thái "Pending" và bắt đầu đếm ngược.
- **Countdown Timer:** Sử dụng `setInterval` hoặc thư viện (như `react-countdown`) để xử lý việc tự động đóng modal khi hết 10 phút.
- **Real-time Update:** - Sử dụng **Socket.io** hoặc **SignalR** để nhận thông báo ngay lập tức khi Backend nhận được tiền.
    - Phương án dự phòng: **Polling** (Cứ mỗi 5s gọi API kiểm tra trạng thái 1 lần).

## 4. Danh sách API cần tích hợp
- `POST /api/bookings/lock`: Khóa sân và lấy link/QR thanh toán.
- `GET /api/bookings/status/{booking_id}`: Kiểm tra trạng thái thanh toán (nếu không dùng Socket).
- `POST /api/bookings/cancel`: Hủy khóa sân chủ động từ phía người dùng.