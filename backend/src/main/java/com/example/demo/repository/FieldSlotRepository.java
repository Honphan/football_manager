package com.example.demo.repository;

import com.example.demo.dto.TimeSlotProjection;
import com.example.demo.entity.FieldSlot;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FieldSlotRepository extends JpaRepository<FieldSlot, Integer> {

    @Query(value = """
    SELECT 
        fs.id as id,
        ts.id as slotId,
        DATE_FORMAT(ts.start_time, '%H:%i') as startTime,
        DATE_FORMAT(ts.end_time, '%H:%i') as endTime,
        CASE 
            WHEN b.status = 'CONFIRMED' THEN 'BOOKED'
            WHEN b.status = 'PENDING' THEN 'LOCKED'
            ELSE 'AVAILABLE' 
        END as status,
        COALESCE(
            (SELECT price FROM field_slot_prices fsp 
             WHERE fsp.field_slot_id = fs.id AND fsp.specific_date = :date AND fsp.price_type = 'SPECIFIC_DATE' LIMIT 1),
            (SELECT price FROM field_slot_prices fsp 
             WHERE fsp.field_slot_id = fs.id AND fsp.day_of_week = :dayOfWeek AND fsp.price_type = 'WEEKDAY' LIMIT 1),
            fs.default_price
        ) as price
    FROM field_slots fs
    JOIN time_slots ts ON fs.time_slot_id = ts.id
    LEFT JOIN bookings b ON b.field_slot_id = fs.id 
        AND b.booking_date = :date 
    WHERE fs.field_id = :fieldId
    AND (:date > CURRENT_DATE OR (:date = CURRENT_DATE AND ts.start_time > :now))
    ORDER BY ts.start_time ASC
""", nativeQuery = true)
    List<TimeSlotProjection> findSlotsWithPrice(@Param("fieldId") Integer fieldId,
                                                @Param("date") LocalDate date,
                                                @Param("dayOfWeek") Integer dayOfWeek,
                                                @Param("now") LocalTime now);


    Optional<FieldSlot> findByFieldIdAndTimeSlotId(Integer fieldId, Integer timeSlotId);
}
