# Thiết kế Giao diện Ứng dụng "Trợ lý Y tế Cá nhân"

## I. Triết lý Thiết kế Giao diện

Giao diện không chỉ là nơi hiển thị thông tin, mà phải đóng vai trò như một người trợ lý y tế tin cậy, chủ động và dễ tiếp cận.

### 1. Rõ ràng & Tin cậy (Clarity & Trust)
- Sử dụng font chữ sans-serif, kích thước chữ đủ lớn.
- Màu sắc chủ đạo: xanh dương y tế, xanh lá cây, trắng, xám nhạt.
- Màu cảnh báo (cam, đỏ) chỉ sử dụng khi thực sự cần thiết.
- Iconography phải nhất quán và dễ hiểu (chọn một bộ icon duy nhất như Ionicons, Feather Icons).

### 2. Tập trung vào Hành động (Action-Oriented)
- Màn hình chính phải trả lời câu hỏi: **"Tôi cần làm gì tiếp theo?"**
- Các nút kêu gọi hành động (Call-to-Action) phải nổi bật và rõ ràng, ví dụ:
  - Xác nhận đã uống thuốc
  - Thanh toán viện phí
  - Đặt khám ngay

### 3. Cá nhân hóa & Chủ động (Personalized & Proactive)
- Hiển thị thông tin liên quan nhất đến người dùng ngay trên màn hình chính.
- Sử dụng thông báo đẩy thông minh để nhắc nhở và cập nhật trạng thái, ví dụ:
  - Đã đến giờ uống thuốc
  - Đã có kết quả xét nghiệm của bạn

---

## II. Cấu trúc Màn hình (Screen Architecture)

Ứng dụng sử dụng mô hình **Tab Navigation** ở cấp cao nhất với 5 tab chính, mỗi tab đại diện cho một nhóm chức năng cốt lõi.

### A. Thanh Điều hướng chính (Bottom Tab Navigator)
1. **Trang chủ (Home)**: Bảng điều khiển chính, hiển thị thông tin quan trọng nhất trong ngày.  
2. **Lịch trình (Schedule)**: Quản lý lịch uống thuốc và lịch hẹn khám.  
3. **Hồ sơ Y bạ (Medical Records)**: Lưu trữ toàn bộ lịch sử khám chữa bệnh.  
4. **Thông báo (Notifications)**: Hộp thư chứa tất cả các thông báo từ hệ thống.  
5. **Tài khoản (Account)**: Quản lý thông tin cá nhân, cài đặt và các chức năng phụ.

---

### B. Chi tiết từng màn hình (Screen Breakdown)

#### 1. Trang chủ (Home)
**Mục đích**: Cung cấp cái nhìn tổng quan và các hành động nhanh.

**Cấu trúc:**
- **Header**: Lời chào cá nhân hóa, ví dụ: *"Chào buổi sáng, [Tên bệnh nhân]!"*.
- **Thẻ Hành động chính (Hero Card)**: Hiển thị cữ thuốc sắp tới hoặc đang active, kèm nút lớn **"Đánh dấu đã uống"** (nổi bật nhất).
- **Thẻ Lịch hẹn sắp tới**: Hiển thị thông tin nếu có lịch hẹn trong ngày và nút **"Xem chi tiết"**.
- **Lối tắt Nhanh (Quick Actions)**: Truy cập nhanh các chức năng quan trọng:
  - Đặt khám
  - Thanh toán viện phí
  - Xem kết quả mới nhất
  - Nhắn tin CSKH
- **Tin tức & Bài viết**: Hiển thị một số bài viết nổi bật từ bệnh viện.

---

#### 2. Lịch trình (Schedule)
**Mục đích**: Quản lý chi tiết lịch uống thuốc và lịch hẹn.

**Cấu trúc:**
- **Component Lịch (Calendar View)**: Thanh lịch ngang để chọn ngày.
- **DoseList Component**: Hiển thị các cữ thuốc trong ngày được chọn theo dạng dòng thời gian.
- **Nút Chuyển đổi (Toggle)**: Chuyển giữa "Lịch uống thuốc" và "Lịch hẹn khám".

---

#### 3. Hồ sơ Y bạ (Medical Records)
**Mục đích**: Tra cứu toàn bộ lịch sử y tế.

**Cấu trúc:**
- **Dòng thời gian Lịch sử Khám (Timeline View)**: Liệt kê các lần khám theo thứ tự thời gian giảm dần, mỗi item hiển thị ngày khám và chẩn đoán chính.
- **Màn hình Chi tiết một Lần khám**:
  - **Tab Tổng quan**: Thông tin chung, chẩn đoán.
  - **Tab Kết quả CLS**: Danh sách kết quả (X-quang, xét nghiệm...), có thể mở file PDF ký số hoặc hình ảnh PACS.
  - **Tab Đơn thuốc**: Hiển thị đơn thuốc của lần khám.
  - **Tab Nội trú**: Nếu có, hiển thị thông tin điều trị nội trú.

---

#### 4. Thông báo (Notifications)
**Mục đích**: Hộp thư thông báo.

**Cấu trúc:**
- Danh sách thông báo theo thời gian.
- Phân loại thông báo: nhắc thuốc, kết quả mới, lịch hẹn, thanh toán.
- Trạng thái "đã đọc" / "chưa đọc".

---

#### 5. Tài khoản (Account)
**Mục đích**: Quản lý thông tin và chức năng phụ.

**Cấu trúc:**
- **Thông tin cá nhân**: Avatar, tên, mã bệnh nhân.
- **Danh sách tùy chọn (List Menu)**:
  - Thông tin cá nhân & Y tế (Khai báo y tế)
  - Lịch sử thanh toán
  - Dịch vụ bệnh viện (đặt dịch vụ ăn uống, vận chuyển…)
  - Góp ý & Đánh giá
  - Cài đặt (thông báo, bảo mật…)
  - Đăng xuất
