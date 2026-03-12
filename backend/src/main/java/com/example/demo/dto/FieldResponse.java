package com.example.demo.dto;

import com.example.demo.enums.FieldStatus;
import com.example.demo.enums.FieldType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

public class FieldResponse {
    private Integer id;

    private String name;

    @Enumerated(EnumType.STRING)
    private FieldType fieldType;

    private String description;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private FieldStatus status;
}
