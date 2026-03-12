package com.example.demo.entity;

import com.example.demo.enums.SlotStatus;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "field_slots")
@Data
public class FieldSlot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne @JoinColumn(name = "field_id")
    private Field field;

    @ManyToOne @JoinColumn(name = "time_slot_id")
    private TimeSlot timeSlot;


    private Double defaultPrice;
}
