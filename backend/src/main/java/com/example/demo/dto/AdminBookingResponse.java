package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@Builder
public class AdminBookingResponse {
    private Integer id;
    private String customerName;
    private String customerPhone;
    private String fieldName;
    private String startTime;
    private String endTime;
    private LocalDate bookingDate;
    private Double totalPrice;
    private String status;
}
