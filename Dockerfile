# Dockerfile (Đã cải tiến)

# ==================================================================
# Giai đoạn 1: Base - Cài đặt dependencies
# Giai đoạn này sẽ được cache lại nếu package.json không đổi
# ==================================================================
FROM node:20-alpine AS base

WORKDIR /usr/src/app

# Chỉ copy package.json và package-lock.json trước
COPY package*.json ./

# Chạy npm ci để cài đặt chính xác từ package-lock.json
# Điều này nhanh hơn và đáng tin cậy hơn npm install
RUN npm ci


# ==================================================================
# Giai đoạn 2: Development - Tối ưu cho hot-reloading
# ==================================================================
FROM base AS development

WORKDIR /usr/src/app

# Sao chép node_modules đã được cài đặt từ giai đoạn base
COPY --from=base /usr/src/app/node_modules ./node_modules

# Sao chép toàn bộ source code
COPY . .

# CMD sẽ được chỉ định trong docker-compose.dev.yml


# ==================================================================
# Giai đoạn 3: Builder - Build code TypeScript ra JavaScript
# ==================================================================
FROM base AS builder

WORKDIR /usr/src/app

# Sao chép node_modules đã được cài đặt từ giai đoạn base
COPY --from=base /usr/src/app/node_modules ./node_modules

# Sao chép toàn bộ source code
COPY . .

# Build toàn bộ monorepo
RUN npm run build


# ==================================================================
# Giai đoạn 4: Production - Image cuối cùng, siêu nhẹ và an toàn
# ==================================================================
FROM node:20-alpine AS production

# ARG để truyền tên service vào khi build
ARG APP_NAME

WORKDIR /usr/src/app

# Chỉ copy các dependencies cần thiết cho production từ giai đoạn base
# Điều này giúp image nhẹ hơn nữa
COPY --from=base /usr/src/app/node_modules ./node_modules
COPY package*.json ./

# Sao chép code đã được build của service cụ thể và các libs
COPY --from=builder /usr/src/app/dist/apps/${APP_NAME} ./dist/apps/${APP_NAME}
COPY --from=builder /usr/src/app/dist/libs ./dist/libs

EXPOSE 3000

CMD ["node", "dist/apps/${APP_NAME}/main"]