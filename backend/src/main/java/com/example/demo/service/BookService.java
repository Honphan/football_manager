package com.example.demo.service;

import com.example.demo.config.vnpay.VnPayService;
import com.example.demo.dto.*;
import com.example.demo.entity.Booking;
import com.example.demo.entity.FieldSlot;
import com.example.demo.entity.User;
import com.example.demo.enums.BookingStatus;
import com.example.demo.enums.SlotStatus;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.FieldSlotRepository;
import com.example.demo.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class BookService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final FieldSlotRepository fieldSlotRepository;
    private final VnPayService vnPayService;

    // Định dạng Key Redis: lock:field:1:date:2026-01-22:slot:5
    private static final String LOCK_KEY_FORMAT = "lock:field:%d:date:%s:slot:%d";

    @Transactional
    public ApiResponse<String> bookingSlot(BookingRequest request, Long userId) {
        return null;
    }

    public ResponseEntity<ApiResponse<List<BookingResponse>>> getBookingHistory(Long id){
        return null;
    }

    @Transactional
    public LockSlotResponse createBookingAndGetUrl(LockSlotRequest request, HttpServletRequest httpRequest, Long userId) {
        LocalDate bookingDate = LocalDate.parse(request.getDate());

        String lockKey = String.format(LOCK_KEY_FORMAT, request.getFieldId(), request.getDate(), request.getSlotId());

        Boolean isLocked = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "PENDING", Duration.ofMinutes(15));

        if(Boolean.FALSE.equals(isLocked)){
            throw new RuntimeException("Ca này đã có người đang thao tác thanh toán!");
        }

        FieldSlot fieldSlot = fieldSlotRepository.findByFieldIdAndTimeSlotId(request.getFieldId(), request.getSlotId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay khung gio cho san va ngay da chon!"));

        Booking booking = bookingRepository.findByUserIdAndFieldSlotIdAndBookingDate(userId, fieldSlot.getId(), bookingDate)
                .orElse(new Booking());

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new RuntimeException("Bạn đã đặt và thanh toán thành công ca này rồi!");
        }

        if (booking.getId() == null) {
            User user = userRepository.findUserById(userId);
            booking.setUser(user);
            booking.setFieldSlot(fieldSlot);
            booking.setBookingDate(bookingDate);
        }

        booking.setActualPrice(request.getPrice());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        bookingRepository.save(booking);

        // 5. Tạo URL VNPAY
        String paymentUrl = vnPayService.createPaymentUrl(
                httpRequest,
                request.getPrice().longValue(),
                "Thanh toan dat san ID: " + booking.getId(),
                String.valueOf(booking.getId())
        );

        return LockSlotResponse.builder()
                .bookingId(booking.getId())
                .paymentUrl(paymentUrl)
                .expiresAt(LocalDateTime.now().plusMinutes(15).toString())
                .totalPrice(request.getPrice())
                .fieldName(fieldSlot.getField().getName())
                .slotStartTime(fieldSlot.getTimeSlot().getStartTime().toString())
                .slotEndTime(fieldSlot.getTimeSlot().getEndTime().toString())
                .date(request.getDate())
                .build();
    }

    @Transactional
    public void confirmBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();

        if (booking.getStatus() == BookingStatus.CONFIRMED) return;

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        String lockKey = String.format("lock:field:%d:date:%s:slot:%d",
                booking.getFieldSlot().getField().getId(),
                booking.getBookingDate().toString(),
                booking.getFieldSlot().getTimeSlot().getId());

        long ttl = Duration.between(LocalDateTime.now(),
                booking.getBookingDate().atTime(23, 59, 59)).getSeconds();

        if (ttl > 0) {
            redisTemplate.opsForValue().set(lockKey, "BOOKED", Duration.ofSeconds(ttl));
        }
    }

    @Transactional
    public void cancelBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        String lockKey = String.format("lock:field:%d:date:%s:slot:%d",
                booking.getFieldSlot().getField().getId(),
                booking.getBookingDate().toString(),
                booking.getFieldSlot().getTimeSlot().getId());
        redisTemplate.delete(lockKey);
    }


    // 1. Lấy thông tin tóm tắt cho User
    public UserProfileSummary getUserSummary(Long userId) {
        User user = userRepository.findUserById(userId);
        return UserProfileSummary.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getUsername())
                .totalBookings(bookingRepository.countByUserId(user.getId()))
                .successfulBookings(bookingRepository.countByUserIdAndStatus(user.getId(), BookingStatus.CONFIRMED))
                .pendingBookings(bookingRepository.countByUserIdAndStatus(user.getId(), BookingStatus.PENDING))
                .cancelledBookings(bookingRepository.countByUserIdAndStatus(user.getId(), BookingStatus.CANCELLED))
                .build();
    }

    // 2. Admin xác nhận bằng tay (Tiền mặt)
    @Transactional
    public void adminConfirmBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Đồng bộ Redis: Chuyển sang BOOKED
        updateRedisStatus(booking, "BOOKED");
    }

    // 3. Admin hủy đơn
    @Transactional
    public void adminCancelBooking(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        String lockKey = generateLockKey(booking);

        if (redisTemplate.hasKey(lockKey)) {
            redisTemplate.delete(lockKey);
            System.out.println("Đã giải phóng sân trong Redis: " + lockKey);
        }
    }

    private void updateRedisStatus(Booking b, String status) {
        String lockKey = generateLockKey(b);
        long ttl = Duration.between(LocalDateTime.now(), b.getBookingDate().atTime(23, 59)).getSeconds();
        if (ttl > 0) redisTemplate.opsForValue().set(lockKey, status, Duration.ofSeconds(ttl));
    }

    private String generateLockKey(Booking b) {
        return String.format("lock:field:%d:date:%s:slot:%d",
                b.getFieldSlot().getField().getId(), b.getBookingDate(), b.getFieldSlot().getTimeSlot().getId());
    }


    public PageResponse<AdminBookingResponse> findAllAdminBookings(
            LocalDate date,
            Integer fieldId,
            String phone,
            Pageable pageable) {

        Page<Booking> bookingPage = bookingRepository.findAllAdminBookings(date, fieldId, phone, pageable);

        Page<AdminBookingResponse> dtoPage = bookingPage.map(b -> AdminBookingResponse.builder()
                .id(b.getId())
                .customerName(b.getUser().getFullName())
                .customerPhone(b.getUser().getUsername()) // SĐT để admin liên hệ
                .fieldName(b.getFieldSlot().getField().getName())
                .fieldName(b.getFieldSlot().getField().getFieldType().toString())
                .bookingDate(b.getBookingDate())
                .startTime(b.getFieldSlot().getTimeSlot().getStartTime().toString())
                .endTime(b.getFieldSlot().getTimeSlot().getEndTime().toString())
                .totalPrice(b.getActualPrice())
                .status(b.getStatus().name())
                .build());

        return PageResponse.fromPage(dtoPage);
    }


    public PageResponse<BookingResponse> getMyBookings(Long userId, Pageable pageable){
           Page<Booking> bookingPage = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

           Page<BookingResponse> bookingResponses = bookingPage.map(b -> BookingResponse.builder()
                   .id(Long.valueOf(b.getId()))
                   .fieldName(b.getFieldSlot().getField().getName())
                   .fieldImageUrl(b.getFieldSlot().getField().getImageUrl())
                   .slotName(b.getFieldSlot().getTimeSlot().getSlotName())
                   .timeRange(b.getFieldSlot().getTimeSlot().getStartTime() + " - " + b.getFieldSlot().getTimeSlot().getEndTime())
                   .bookingDate(b.getBookingDate())
                   .totalAmount(b.getActualPrice())
                   .status(b.getStatus())
                   .createdAt(b.getCreatedAt())
                   .build()
           );



        return PageResponse.fromPage(bookingResponses);
    }

}
