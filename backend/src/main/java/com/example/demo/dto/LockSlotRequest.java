package com.example.demo.dto;

import lombok.Data;

@Data
public class LockSlotRequest {
    private Integer fieldId;
    private Integer slotId; // ID của ca (TimeSlot)
    private String date;    // Định dạng "yyyy-MM-dd"
    private Double price;
}
