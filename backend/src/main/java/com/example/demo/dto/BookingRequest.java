package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class BookingRequest {
    private Integer fieldId;
    private Integer slotId;
    private LocalDate bookingDate;
}
