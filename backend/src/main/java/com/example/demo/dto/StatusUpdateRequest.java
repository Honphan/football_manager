package com.example.demo.dto;

import com.example.demo.enums.FieldStatus;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    private FieldStatus status; // Enum: AVAILABLE, MAINTENANCE, BUSY
}
