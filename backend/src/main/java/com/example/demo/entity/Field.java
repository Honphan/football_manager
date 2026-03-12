package com.example.demo.entity;

import com.example.demo.enums.FieldStatus;
import com.example.demo.enums.FieldType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "fields")
@Data
public class Field {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @Enumerated(EnumType.STRING)
    private FieldType fieldType;

    private String description;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private FieldStatus status;
}