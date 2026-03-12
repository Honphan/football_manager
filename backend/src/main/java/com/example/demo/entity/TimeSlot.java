package com.example.demo.entity;

import com.example.demo.enums.SlotStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalTime;

@Entity
@Table(name = "time_slots")
@Data
public class TimeSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String slotName;
    private LocalTime startTime;
    private LocalTime endTime;
}
