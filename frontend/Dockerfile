# --- Stage 1: Build React ra các file tĩnh (HTML, CSS, JS) ---
FROM node:20-alpine AS builder
WORKDIR /app

# Copy file quản lý thư viện và cài đặt
COPY package*.json ./
RUN npm ci 

# Copy toàn bộ code và tiến hành build
COPY . .
RUN npm run build

# --- Stage 2: Serve ứng dụng bằng Nginx ---
FROM nginx:stable-alpine

# Xóa trang web mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy code đã build từ Stage 1 vào Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

