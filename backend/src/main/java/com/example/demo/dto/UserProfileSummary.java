package com.example.demo.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileSummary {
    private String fullName;
    private String email;
    private String phone;
    private long totalBookings;
    private long successfulBookings;
    private long pendingBookings;
    private long cancelledBookings;
}
