package com.example.demo.controller;

import com.example.demo.dto.TimeSlotResponse;
import com.example.demo.service.FieldSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fields")
public class FieldSlotController {

    @Autowired
    private FieldSlotService fieldSlotService;

    @GetMapping("/{fieldId}/slots")
    public ResponseEntity<List<TimeSlotResponse>> getSlots(
            @PathVariable Integer fieldId,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        if (date == null) date = LocalDate.now();

        List<TimeSlotResponse> slots = fieldSlotService.getAvailableSlots(fieldId, date);
        return ResponseEntity.ok(slots);
    }
}
