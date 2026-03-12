package com.example.demo.service;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.FieldRequest;
import com.example.demo.entity.Field;
import com.example.demo.enums.FieldStatus;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.FieldRepository;
import com.example.demo.repository.TimeSlotRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class FieldService {
    private final FieldRepository fieldRepository;
    private final BookingRepository bookingRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final StringRedisTemplate redisTemplate;

    public ResponseEntity<?> getAllFields(Boolean isAdmin) {
        List<Field> fields = isAdmin
                ? fieldRepository.findAll()
                : fieldRepository.findAllByStatusIs(FieldStatus.AVAILABLE);
        return ResponseEntity.of(Optional.of(fields));
    }

    public ResponseEntity<?> getFieldById(Integer id){
        Optional<Field> field = fieldRepository.findById(id);
        return ResponseEntity.of(field);
    }

    public ResponseEntity<?> updateField(Integer id, FieldRequest fieldrequest) {
        Optional<Field> fieldOptional = fieldRepository.findById(id);

        if (fieldOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Field existingField = fieldOptional.get();

        //  Cập nhật name
        if (StringUtils.hasText(fieldrequest.getName())) {
            existingField.setName(fieldrequest.getName());
        }

        // Cập nhật Image URL
        if (StringUtils.hasText(fieldrequest.getImageUrl())) {
            existingField.setImageUrl(fieldrequest.getImageUrl());
        }
        // Cập nhật Field Type
        if (fieldrequest.getFieldType() != null) {
            existingField.setFieldType(fieldrequest.getFieldType());
        }

        // Cập nhật Description
        if (StringUtils.hasText(fieldrequest.getDescription())) {
            existingField.setDescription(fieldrequest.getDescription());
        }

        Field updatedField = fieldRepository.save(existingField);
        return ResponseEntity.ok(updatedField);
    }

    public ApiResponse<?> softDeleteField(Integer id){
        Optional<Field> field = fieldRepository.findById(id);
        field.get().setStatus(FieldStatus.MAINTENANCE);
        fieldRepository.save(field.get());
        return ApiResponse.response("","Xoa san thanh cong",200);
    }

    public Field updateStatus(Integer id, FieldStatus status){
        Field field = fieldRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sân bóng ID: " + id));
        field.setStatus(status);

        return fieldRepository.save(field);
    }

    public ResponseEntity<?> createField(FieldRequest request){
        Field field = new Field();
        field.setName(request.getName());
        field.setImageUrl(request.getImageUrl());
        field.setFieldType(request.getFieldType());
        field.setDescription(request.getDescription());
        field.setStatus(FieldStatus.AVAILABLE);

        Field savedField = fieldRepository.save(field);
        return ResponseEntity.ok(savedField);
    }

}
