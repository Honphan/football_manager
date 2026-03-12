package com.example.demo.dto;


import com.example.demo.enums.FieldStatus;
import com.example.demo.enums.FieldType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FieldRequest {
    private String name;
    private String imageUrl;
    private FieldType fieldType;
    private String description;
}
