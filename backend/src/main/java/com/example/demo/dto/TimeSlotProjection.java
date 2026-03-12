package com.example.demo.dto;

public interface TimeSlotProjection {
    Integer getId();
    Integer getSlotId();
    String getStartTime();
    String getEndTime();
    Double getPrice();
    String getStatus();
}
