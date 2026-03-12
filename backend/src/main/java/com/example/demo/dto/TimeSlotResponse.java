package com.example.demo.dto;

import com.example.demo.enums.SlotStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TimeSlotResponse {
    private Integer id;        // Đây là field_slot_id để gửi lên khi đặt sân
    private Integer slotId;
    private String startTime;  // Format "HH:mm"
    private String endTime;
    private SlotStatus status;
    private Double price;      // Giá cuối cùng sau khi tính toán
}
