package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LockSlotResponse {
    private Integer bookingId;
    private String paymentUrl;
    private String expiresAt;      // ISO 8601 string
    private Double totalPrice;
    private String fieldName;
    private String slotStartTime;
    private String slotEndTime;
    private String date;
}
