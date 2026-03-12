package com.example.demo.entity;

import com.example.demo.enums.PriceType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "field_slot_prices")
@Data
public class FieldSlotPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne @JoinColumn(name = "field_slot_id")
    private FieldSlot fieldSlot;

    @Enumerated(EnumType.STRING)
    private PriceType priceType;

    private Integer dayOfWeek; // 2 -> 8

    private LocalDate specificDate;

    private Double price;

    private String description;
}
