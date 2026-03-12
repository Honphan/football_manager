package com.example.demo.dto;

import com.example.demo.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String fieldName;
    private String fieldImageUrl;
    private String slotName;
    private String timeRange; // "17:30 - 19:00"
    private LocalDate bookingDate;
    private Double totalAmount;
    private BookingStatus status; // CONFIRMED, CANCELLED, PENDING
    private LocalDateTime createdAt;
}
