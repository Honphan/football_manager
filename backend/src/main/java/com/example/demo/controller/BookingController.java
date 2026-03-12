package com.example.demo.controller;

import com.example.demo.config.UserPrincipal;
import com.example.demo.dto.*;
import com.example.demo.repository.BookingRepository;
import com.example.demo.service.BookService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class BookingController {

    private final BookService bookingService;
    private final BookingRepository bookingRepository;

    @PostMapping
    public ApiResponse<String> BookingSlot(
            @RequestBody BookingRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

       return bookingService.bookingSlot(request,currentUser.getId());
    }

    @GetMapping("/bookings/history")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {

        return bookingService.getBookingHistory(userPrincipal.getId());
    }

    @PostMapping("/bookings/lock-slot")
    public ResponseEntity<?> lockSlot(
            @RequestBody LockSlotRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser,
            HttpServletRequest httpServletRequest) {

        try {
            LockSlotResponse response = bookingService.createBookingAndGetUrl(
                    request, httpServletRequest, currentUser.getId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/bookings/my-bookings")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal UserPrincipal user, Pageable pageable) {
        return ResponseEntity.ok(bookingService.getMyBookings(user.getId(), pageable));
    }

    @GetMapping("/users/profile/summary")
    public ResponseEntity<?> getProfileSummary(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(bookingService.getUserSummary(user.getId()));
    }

    // ADMIN APIs
    @GetMapping("/admin/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Integer fieldId,
            @RequestParam(required = false) String phone,
            Pageable pageable) {
        return ResponseEntity.ok(bookingService.findAllAdminBookings(date, fieldId, phone, pageable));
    }

    @PutMapping("/admin/bookings/{id}/confirm")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> confirmManual(@PathVariable Integer id) {
        bookingService.adminConfirmBooking(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/admin/bookings/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminCancel(@PathVariable Integer id) {
        bookingService.adminCancelBooking(id);
        return ResponseEntity.ok().build();
    }
}
