# Tài Liệu Kiến Trúc Hệ Thống MedPlusApp

Chào mừng bạn đến với tài liệu kiến trúc của hệ thống backend MedPlusApp. Tài liệu này được thiết kế để cung cấp một cái nhìn **toàn cảnh và chi tiết** về hệ thống microservices của chúng ta, từ kiến trúc tổng thể cho đến từng luồng nghiệp vụ cụ thể.

Tài liệu này dành cho **developer mới**, **kiến trúc sư phần mềm**, và **quản lý kỹ thuật**.

---

## 🗺️ Mục Lục & Hướng Dẫn

Hệ thống tài liệu được tổ chức theo cấu trúc phân tầng để dễ dàng điều hướng và tra cứu.

### 🏛️ `00_System_Architecture`
> **Mục đích:** Cung cấp cái nhìn **tổng quan toàn hệ thống** ở mức cao nhất. Đây là điểm khởi đầu tốt nhất cho bất kỳ ai mới tham gia dự án.

-   **[`01_High_Level_Overview.md`](./00_System_Architecture/01_High_Level_Overview.md):**
    -   Sơ đồ kiến trúc tổng quan, mô tả các microservices chính, database, và các hệ thống bên ngoài.
    -   Giải thích trách nhiệm của từng thành phần chính.
-   **[`02_Technology_Stack.md`](./00_System_Architecture/02_Technology_Stack.md):**
    -   Danh sách chi tiết các công nghệ, frameworks, và thư viện được sử dụng.
    -   Giải thích lý do lựa chọn cho từng công nghệ.
-   **[`03_Conventions_And_Legends.md`](./00_System_Architecture/03_Conventions_And_Legends.md):**
    -   **(Bắt buộc đọc)** Các quy ước về đặt tên, màu sắc, và ký hiệu được sử dụng trong tất cả các sơ đồ.

---

### ⚙️ `01_Cross_Cutting_Concerns`
> **Mục đích:** Mô tả các **mối quan tâm kỹ thuật chung** (non-functional requirements) được áp dụng và tái sử dụng trên toàn bộ hệ thống.

-   **[`01_M2M_Authentication_Flow.md`](./01_Cross_Cutting_Concerns/01_M2M_Authentication_Flow.md):**
    -   **Sequence Diagram** chi tiết về luồng xác thực Machine-to-Machine (M2M) giữa các service.
    -   Giải thích cách `libs/api-clients` và `libs/auth` phối hợp để đảm bảo giao tiếp an toàn.
-   **[`02_Asynchronous_Communication.md`](./01_Cross_Cutting_Concerns/02_Asynchronous_Communication.md):**
    -   Mô tả kiến trúc giao tiếp bất đồng bộ sử dụng **RabbitMQ**.
    -   Định nghĩa các Exchanges, Queues, và các "hợp đồng sự kiện" (Event Contracts).
    -   Giải thích chiến lược xử lý lỗi và Dead Letter Queues (DLQ).

---

### 🚀 `02_Business_Flows`
> **Mục đích:** Mô tả chi tiết các **luồng nghiệp vụ chính** của hệ thống từ đầu đến cuối. Đây là phần **quan trọng nhất** để hiểu cách hệ thống hoạt động.

Mỗi thư mục con đại diện cho một nghiệp vụ lớn:

-   **[`01_User_Onboarding/`](./02_Business_Flows/01_User_Onboarding/):**
    -   **`README.md`**: Mô tả các kịch bản đăng ký và đăng nhập.
    -   **`SD_First_Time_Login.md`**: Sequence Diagram cho luồng đăng nhập lần đầu và phát sự kiện đồng bộ hóa.
    -   **`SD_Existing_User_Login.md`**: Sequence Diagram cho luồng đăng nhập của người dùng đã có tài khoản.

-   **[`02_Medication_Scheduling/`](./02_Business_Flows/02_Medication_Scheduling/):**
    -   **`README.md`**: Mô tả các nghiệp vụ liên quan đến việc tạo và quản lý lịch trình thuốc.
    -   **`SD_Dose_Synchronization.md`**: Sequence Diagram chi tiết về quá trình `scheduling-service` lắng nghe sự kiện và đồng bộ hóa dữ liệu từ Hospital API.
    -   **`SD_Update_Dose_Status.md`**: Sequence Diagram cho luồng người dùng cập nhật trạng thái một liều thuốc (đã uống/bỏ qua).

-   **[`03_Dose_Reminders/`](./02_Business_Flows/03_Dose_Reminders/):**
    -   **`README.md`**: Mô tả cách hệ thống gửi thông báo nhắc thuốc.
    -   **`SD_Scheduling_And_Sending_Notifications.md`**: Sequence Diagram mô tả quá trình từ lúc `scheduling-service` phát sự kiện có độ trễ, cho đến khi `notification-service` nhận và gửi thông báo qua FCM.

---

### 📦 `03_Services` & `04_Libraries`
> **Mục đích:** Cung cấp tài liệu tham khảo chi tiết cho từng **microservice** và **thư viện dùng chung**.

-   **Services (`./03_Services/`):**
    -   Mỗi thư mục con (ví dụ: `account-service`) chứa một file `README.md` mô tả:
        -   **Trách nhiệm chính** của service.
        -   Danh sách các **API endpoint** (GraphQL/REST) mà nó cung cấp.
        -   Danh sách các **sự kiện RabbitMQ** mà nó phát ra (publishes) hoặc lắng nghe (subscribes).
        -   Các **biến môi trường** (`.env`) cần thiết.

-   **Libraries (`./04_Libraries/`):**
    -   Mỗi thư mục con (ví dụ: `api-clients`) chứa một file `README.md` giải thích:
        -   **Mục đích** của thư viện.
        -   **Hướng dẫn sử dụng** và các quy tắc khi cần mở rộng.

---

## ✍️ Quy trình Đóng góp

Tài liệu là một phần không thể thiếu của codebase. Mọi thay đổi về kiến trúc hoặc logic nghiệp vụ quan trọng đều **phải** được phản ánh trong tài liệu này.

1.  **Khi tạo Pull Request (PR):** Đính kèm link đến các file tài liệu đã được tạo mới hoặc cập nhật.
2.  **Review tài liệu:** Việc review tài liệu là một phần bắt buộc của quy trình code review.
3.  **Giữ nhất quán:** Luôn tham khảo file `00_System_Architecture/03_Conventions_And_Legends.md` để đảm bảo các sơ đồ tuân thủ đúng quy ước.