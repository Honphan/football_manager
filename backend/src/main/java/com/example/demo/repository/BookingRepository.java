package com.example.demo.repository;

import com.example.demo.entity.Booking;
import com.example.demo.enums.BookingStatus;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    @Query("SELECT b FROM Booking b WHERE b.fieldSlot.id = :fieldSlotId " +
            "AND b.bookingDate = :date AND b.status IN ('CONFIRMED', 'PENDING')")
    Optional<Booking> findActiveBooking(@Param("fieldSlotId") Integer fieldSlotId,
                                        @Param("date") LocalDate date);

    Optional<Booking> findByUserIdAndFieldSlotIdAndBookingDate(Long userId, Integer fieldSlotId, LocalDate bookingDate);

    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, BookingStatus status);

    @Query(value = """
        SELECT b.* FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN field_slots fs ON b.field_slot_id = fs.id
        WHERE (:date IS NULL OR b.booking_date = :date)
        AND (:fieldId IS NULL OR fs.field_id = :fieldId)
        AND (:phone IS NULL OR u.username LIKE %:phone%)
    """, nativeQuery = true)
    Page<Booking> findAllAdminBookings(@Param("date") LocalDate date,
                                       @Param("fieldId") Integer fieldId,
                                       @Param("phone") String phone,
                                       Pageable pageable);
}
