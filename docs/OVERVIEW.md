Tài liệu Dự án: Ứng dụng Nhắc lịch Uống thuốc
Phiên bản: 1.0.0
Ngày cập nhật: 28/07/2025
1. Tổng quan & Mục tiêu
Dự án này là một hệ thống backend được xây dựng bằng NestJS, phục vụ cho ứng dụng di động/web giúp bệnh nhân theo dõi và tuân thủ lịch uống thuốc theo y lệnh từ bệnh viện.
Mục tiêu chính:
Tự động hóa: Tự động đồng bộ y lệnh từ hệ thống bệnh viện và tạo lịch trình chi tiết cho bệnh nhân.
Nhắc nhở kịp thời: Gửi thông báo đẩy (push notification) đến thiết bị của người dùng khi đến giờ uống thuốc.
Độ tin cậy cao: Đảm bảo không bỏ lỡ bất kỳ yêu cầu hay thông báo nào, ngay cả khi có lỗi tạm thời.
Bảo mật: Phân tách rõ ràng giữa dữ liệu người dùng và giao tiếp giữa các thành phần hệ thống.
Khả năng mở rộng: Xây dựng trên kiến trúc microservices để sẵn sàng cho việc mở rộng các tính năng trong tương lai.
2. Kiến trúc Hệ thống (Microservices)
Hệ thống được xây dựng dựa trên kiến trúc microservices, quản lý trong một monorepo. Mỗi service là một ứng dụng NestJS độc lập, có database riêng và giao tiếp với nhau qua API (đồng bộ) hoặc Message Broker (bất đồng bộ).
Sơ đồ Kiến trúc Tổng quan
![Sơ đồ Kiến trúc](./docs/architecture.png)
2.1. Account Service
Cổng: 3001
Database: db-accounts (PostgreSQL)
Trách nhiệm:
Quản lý danh tính người dùng (User entity: email, password, mabn, roles).
Xử lý xác thực người dùng (đăng ký, đăng nhập qua GraphQL).
Cung cấp endpoint REST (/auth/token) để xác thực M2M (Machine-to-Machine) cho các service khác.
Quản lý fcm_tokens, apn_tokens.
Cung cấp API nội bộ để các service khác có thể truy vấn thông tin user.
2.2. Scheduling Service
Cổng: 3002
Database: db-schedules (PostgreSQL)
Trách nhiệm:
Bộ não của hệ thống.
Cung cấp API (triggerSyncFromHospital) để tiếp nhận yêu cầu đồng bộ y lệnh.
Chứa SyncConsumer để xử lý các yêu cầu đồng bộ một cách bất đồng bộ.
Chứa SyncService với logic cốt lõi: gọi API bệnh viện, phân tích y lệnh, tạo/cập nhật/xóa các Dose.
Publish các sự kiện "cần gửi thông báo" vào RabbitMQ với độ trễ (x-delay).
Cung cấp API cho người dùng cuối để xem lịch trình (myDoses) và cập nhật trạng thái (updateDoseStatus).
2.3. Notification Service
Cổng: Không có (Là một worker "headless").
Database: Không có (Stateless).
Trách nhiệm:
Làm một việc duy nhất: gửi thông báo.
Chứa NotificationConsumer lắng nghe các sự kiện từ RabbitMQ.
Khi nhận được sự kiện, nó sẽ gọi đến Account Service để lấy fcm_tokens của người dùng.
Sử dụng FirebaseService để gửi thông báo đẩy qua FCM.
3. Hướng dẫn Cài đặt & Chạy Môi trường Phát triển
3.1. Yêu cầu
Node.js (v18+)
npm (v9+)
Docker và Docker Compose
3.2. Cài đặt
Clone repository.
Chạy npm install ở thư mục gốc để cài đặt tất cả dependencies.
Thiết lập file môi trường:
Tạo file .env cho mỗi service trong thư mục apps/<service-name>/.
Tham khảo file .env.example (nếu có) để điền các giá trị cần thiết (thông tin kết nối DB, RabbitMQ URI, JWT Secret, URL của các service khác).
Thiết lập Firebase:
Tải file firebase-service-account.json từ Firebase Console.
Đặt file này vào thư mục gốc của dự án.
Thiết lập dữ liệu Mock (Tùy chọn):
Tạo file ylenhthuoc.mock.json ở thư mục gốc để SyncService có thể đọc khi test.
3.3. Chạy dự án
Khởi động hạ tầng (DB, RabbitMQ):
Generated bash
npm run docker:up
Use code with caution.
Bash
Khởi động tất cả các microservice ở chế độ watch:
Generated bash
npm run dev
Use code with caution.
Bash
Lệnh này sẽ khởi động đồng thời 3 service. Log của mỗi service sẽ được gắn tiền tố và tô màu để dễ phân biệt. Mọi thay đổi trong code sẽ tự động reload service tương ứng.
Các cổng truy cập:
Account Service GraphQL: http://localhost:3001/graphql
Scheduling Service GraphQL: http://localhost:3002/graphql
RabbitMQ Management UI: http://localhost:15672 (user: user, pass: password)
4. Luồng dữ liệu chính & API Endpoints
4.1. Luồng đồng bộ y lệnh (Bác sĩ -> Bệnh nhân)
Kích hoạt: Một hệ thống bên ngoài (hoặc API test) gọi mutation triggerSyncFromHospital(mabn: "...") trên Scheduling Service.
Tiếp nhận: HospitalResolver nhận yêu cầu và publish một tin nhắn { mabn } vào SYNC_EXCHANGE của RabbitMQ. API trả về thành công ngay lập tức.
Xử lý nền:
SyncConsumer (trong Scheduling Service) nhận tin nhắn.
Nó gọi SyncService.syncPatientByMabn(mabn).
SyncService gọi UsersService.upsertUserByMabn(mabn) trên Account Service qua API nội bộ để đảm bảo user tồn tại.
SyncService gọi API bệnh viện để lấy y lệnh.
SyncService xử lý dữ liệu, tạo/xóa các Dose trong schedules_db.
SyncService publish các tin nhắn thông báo có x-delay vào NOTIFICATION_EXCHANGE.
Gửi thông báo:
Khi đến giờ, NotificationConsumer (trong Notification Service) nhận tin nhắn.
Nó gọi API userById_internal(id: ...) trên Account Service để lấy fcm_tokens.
Nó gửi thông báo qua FirebaseService.
4.2. Luồng tương tác của người dùng
Xem lịch: Client gọi query myDoses(startDate, endDate) trên Scheduling Service.
Cập nhật trạng thái: Client gọi mutation updateDoseStatus(dose_id, status) trên Scheduling Service.
5. Thư viện dùng chung (libs)
@app/api-clients: Chứa các service client để giao tiếp giữa các microservice (ví dụ: AccountApiClientService, HospitalApiClientService). Giúp đóng gói logic gọi API và tái sử dụng.
@app/common: Chứa các DTO, Enum, hoặc các tiện ích dùng chung cho toàn bộ hệ thống.
@app/rabbitmq-client: Chứa module cấu hình kết nối RabbitMQ (AppRabbitMQModule) để các service có thể import và sử dụng.