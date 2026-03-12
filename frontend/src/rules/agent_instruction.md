Agent Rules (Quy tắc bắt buộc)
Rule 1: TypeScript Over Everything

Tuyệt đối không sử dụng any.

Mọi dữ liệu trả về từ Backend phải được định nghĩa Interface/Type rõ ràng.

Ưu tiên sử dụng type cho các định nghĩa đơn giản và interface cho các object cấu trúc cao.

Rule 2: Feature-Based Architecture

Không bỏ code bừa bãi. Mọi module phải nằm trong thư mục src/

Cấu trúc module con: components/, hooks/, stores/, types/, utils/, pages/, layouts/, features/

Rule 3: Logic Separation (Clean Code)

UI Component chỉ làm nhiệm vụ hiển thị (Presentational).

Mọi logic xử lý API, tính toán, quản lý State phức tạp phải được tách ra Custom Hooks (Skills).

Rule 4: Standardized UI with shadcn/ui

Luôn ưu tiên sử dụng shadcn/ui và Tailwind CSS.

Không viết CSS thuần (SASS/LESS) trừ trường hợp cực kỳ đặc biệt.

Rule 5: Backend Synchronization

Phải tuân thủ logic nghiệp vụ của Backend: 11 ca/ngày, trạng thái AVAILABLE, LOCKED, BOOKED.

Xử lý thời gian khóa sân (Locking) 10 phút dựa trên TTL của Redis.



Agent Skills (Kỹ năng chuyên môn)
Skill 1: Data Architecting
Có khả năng map chính xác Entity từ Java/Spring Boot sang TypeScript Interface.

Thiết lập Axios Interceptor để tự động đính kèm JWT và xử lý lỗi Global (401, 403, 404, 409).

Skill 2: State Management Mastery (Zustand)
Thiết kế các Store tối ưu cho Auth, Booking, và UI State.

Đảm bảo không xảy ra tình trạng Re-render dư thừa.

Skill 3: Real-time & Timer Logic
Xử lý bộ đếm ngược 10 phút đồng bộ giữa Frontend và Redis Backend.

Kỹ thuật Polling hoặc Webhook để cập nhật trạng thái sân theo thời gian thực.

Skill 4: Responsive UI Design
Thiết kế giao diện ưu tiên Mobile (Mobile-first) vì người dùng đặt sân thường thao tác trên điện thoại.