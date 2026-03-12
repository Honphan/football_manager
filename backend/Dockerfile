# --- Stage 1: Build file JAR bằng Maven ---
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app

# Copy pom.xml và tải các dependency (giúp tận dụng cache của Docker)
COPY pom.xml .
# Chạy lệnh này để tải thư viện trước, tiết kiệm thời gian cho các lần build sau
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code và build
COPY src ./src
RUN mvn clean package -DskipTests

# --- Stage 2: Chạy ứng dụng với JRE siêu nhẹ ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Khai báo timezone (Tùy chọn, rất hữu ích cho app ở VN)
ENV TZ=Asia/Ho_Chi_Minh

# Copy file JAR từ Stage 1 sang Stage 2
COPY --from=builder /app/target/*.jar app.jar

# Spring Boot mặc định chạy port 8080
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]