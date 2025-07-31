FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

# Copy thư viện dùng chung và code của service này
COPY dist/libs/common ./libs/common
COPY dist/apps/account-service ./apps/account-service

# Lệnh để chạy service
CMD ["node", "apps/account-service/main"]