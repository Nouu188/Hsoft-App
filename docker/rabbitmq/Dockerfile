# docker/rabbitmq/Dockerfile

# Bắt đầu từ image RabbitMQ chính thức có giao diện quản lý
# Dùng phiên bản cụ thể để đảm bảo tính ổn định
FROM rabbitmq:4.1

# Copy file cấu hình plugin vào đúng vị trí
# RabbitMQ sẽ tự động đọc file này khi khởi động và kích hoạt các plugin được liệt kê
COPY enabled_plugins /etc/rabbitmq/

# Copy file cấu hình chính vào đúng vị trí
COPY rabbitmq.conf /etc/rabbitmq/