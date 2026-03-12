# 🏟️ Football Manager - Admin Dashboard Planner (Antigravity Project)

Bản kế hoạch xây dựng giao diện Quản trị viên tập trung vào việc quản lý tài nguyên sân, cấu hình giá linh hoạt và tối ưu hóa quy trình vận hành ca đấu.
- Khi click vào 1 sân nào đó thì hiển thị full tất cả mọi thứ của sân đó để admin có thể chỉnh sửa được xóa phần đặt sân bên trang admin

- Thêm, xóa, khóa sân do sửa chữa, sửa sân

- Hiện các ca để có thể sửa đổi các ca như giá tiền của ngày hôm nay cũng như của 1 ngày cụ thể

- Sửa đổi các ca chung như thời gian các ca bị đẩy lên do mùa, giá tiền tăng chung do chi phí phát sinh

- Có thể khóa hoặc mở khóa cho mọi ca

- Đảm bảo các ca là 1h30p và liền nhau

---

## 1. 🏗️ Kiến trúc Giao diện & Công nghệ
* **Framework:** React 19 + Vite.
* **Styling:** Tailwind CSS (Sử dụng hệ biến `@theme` đã thiết kế).
* **UI Library:** shadcn/ui (Sheet, Dialog, Calendar, Table, Toast).
* **State Management:** Zustand (để đồng bộ trạng thái sân/ca).
* **Validation:** Zod + React Hook Form (đảm bảo tính hợp lệ của thời gian).

---

## 2. 📋 Danh mục Chức năng (Admin Roadmap)

### A. Quản lý Sân bóng (Field CRUD)
Thay vì một trang mới, sử dụng **Side Sheet** để giữ trải nghiệm liền mạch.
* **Hiển thị chi tiết:** Khi click vào thẻ Sân, một `Sheet` sẽ trượt ra từ bên phải hiển thị:
    * Thông tin cơ bản (Tên, Loại sân 5/7/11, Mô tả).
    * Trạng thái hiện tại (Đang hoạt động / Bảo trì).
* **Thêm/Xóa/Sửa:**
    * Sử dụng `Dialog` xác nhận khi xóa để tránh nhầm lẫn.
    * Nút **"Khóa sân bảo trì"**: Khi kích hoạt, tự động chuyển `status` của sân về `MAINTENANCE` và vô hiệu hóa mọi lượt đặt mới.

### B. Quản lý Ca & Giá linh hoạt (Smart Slot & Pricing)
Phân tách rõ ràng giữa **Cấu hình hệ thống** và **Điều chỉnh thực tế**.

#### 1. Điều chỉnh theo ngày cụ thể (Specific Day Management)
* **Giao diện:** View Calendar (Lịch) bên trái + List Slot bên phải.
* **Chức năng:**
    * Chọn một ngày bất kỳ trên lịch.
    * Hiển thị danh sách 11 ca của ngày đó.
    * **Edit Price:** Admin có thể ghi đè giá cho ca đó (chỉ áp dụng cho ngày đã chọn).
    * **Quick Lock/Unlock:** Khóa nhanh một ca lẻ (ví dụ: giữ sân cho giải đấu nội bộ).

#### 2. Cấu hình Ca hệ thống (Global Time Settings)
Dùng cho việc đổi khung giờ theo mùa hoặc tăng giá hàng loạt.
* **Quy tắc Logic (Hard Rules):**
    * **Fix Duration:** Mỗi ca mặc định là 90 phút (1.5h).
    * **Sequential Logic:** `Start_Time(Ca_N) = End_Time(Ca_N-1)`. 
    * **Auto-calculate:** Admin chỉ cần chỉnh `Start_Time` của Ca 1, hệ thống tự động đẩy giờ cho 10 ca còn lại.
* **Cập nhật giá chung:** Một form cho phép tăng/giảm % giá hoặc set cứng giá mới cho tất cả các sân cùng loại.

---

## 3. 🎨 Thiết kế Component (shadcn/ui Mapping)

| Chức năng | Component đề xuất | Đặc điểm UI |
| :--- | :--- | :--- |
| **Danh sách sân** | `Card` + `Badge` | Hiện ảnh sân, loại sân và badge trạng thái (Active/Maintenance). |
| **Chi tiết & Chỉnh sửa** | `Sheet` | Hiển thị full thông tin sân mà không cần load lại trang. |
| **Quản lý lịch/ngày** | `Calendar` | Cho phép admin chọn ngày để cấu hình giá đặc biệt. |
| **Danh sách ca** | `Table` | Hiển thị Start - End - Price - Status. |
| **Thông báo** | `Sonner` (Toast) | Hiện thông báo "Cập nhật giá thành công" hoặc "Lỗi trùng lịch". |

---

## 4. 🧠 Logic xử lý Frontend quan trọng

### 🔄 Thuật toán tính toán Ca liền mạch (1h30p)
Trong form cấu hình Global, chúng ta sẽ xử lý mảng dữ liệu như sau:
```typescript
const updateSlots = (firstStartTime: string) => {
  let currentStart = firstStartTime;
  return Array.from({ length: 11 }).map((_, index) => {
    const end = addMinutes(currentStart, 90); // Dùng thư viện date-fns
    const slot = { start: currentStart, end: end };
    currentStart = end; // Ca sau bắt đầu ngay khi ca trước kết thúc
    return slot;
  });
};