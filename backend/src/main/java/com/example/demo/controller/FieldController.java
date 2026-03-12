package com.example.demo.controller;

import com.example.demo.config.UserPrincipal;
import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.FieldRequest;
import com.example.demo.dto.StatusUpdateRequest;
import com.example.demo.dto.UpdateSlotSpecificDateRequest;
import com.example.demo.entity.Field;
import com.example.demo.service.FieldService;
import com.example.demo.service.FieldSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class    FieldController {

    @Autowired
    private FieldService fieldService;
    @Autowired
    private FieldSlotService fieldSlotService;

    @GetMapping(value = "/fields")
    public ResponseEntity<?> getAllFields(@AuthenticationPrincipal UserPrincipal currentUser) {
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return fieldService.getAllFields(isAdmin);
    }

    @PostMapping("/admin/fields")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createField(@RequestBody FieldRequest fieldRequest){
     return fieldService.createField(fieldRequest);
    }

    @GetMapping("/fields/{id}")
    public ResponseEntity<?> getFieldById(@PathVariable Integer id) {
        return fieldService.getFieldById(id);
    }

    @PutMapping("/admin/fields/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateField(
            @PathVariable Integer id,
            @RequestBody FieldRequest fieldrequest) {

        return fieldService.updateField(id, fieldrequest);
    }

    @DeleteMapping("/admin/fields/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> softDeleteField(@PathVariable Integer id) {
        return fieldService.softDeleteField(id);
    }

    @PatchMapping("/admin/fields/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFieldStatus(@PathVariable Integer id, @RequestBody StatusUpdateRequest request) {
        Field updatedField = fieldService.updateStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedField);
    }

    @PatchMapping("/admin/fields/{fieldId}/slots/{slotId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> patchSlotSpecific(
            @PathVariable Integer fieldId,
            @PathVariable Integer slotId,
            @RequestBody UpdateSlotSpecificDateRequest request) {

        fieldSlotService.updateSlotForSpecificDate(fieldId, slotId, request);
        return ResponseEntity.ok(Map.of("message", "Cập nhật ca sân ngày " + request.getDate() + " thành công"));
    }


}
