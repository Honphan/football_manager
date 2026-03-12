package com.example.demo.service;

import com.example.demo.dto.TimeSlotProjection;
import com.example.demo.dto.TimeSlotResponse;
import com.example.demo.dto.UpdateSlotSpecificDateRequest;
import com.example.demo.entity.FieldSlot;
import com.example.demo.entity.FieldSlotPrice;
import com.example.demo.enums.PriceType;
import com.example.demo.enums.SlotStatus;
import com.example.demo.repository.FieldSlotPriceRepository;
import com.example.demo.repository.FieldSlotRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Time;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class FieldSlotService {

    private final FieldSlotRepository fieldSlotRepository;
    private final FieldSlotPriceRepository fieldSlotPriceRepository;


    public List<TimeSlotResponse> getAvailableSlots(Integer fieldId, LocalDate date) {
        int dayOfWeek = date.getDayOfWeek().getValue() + 1;
        if (dayOfWeek > 7) dayOfWeek = 1; // Nếu là 8 (do Sun=7 + 1) thì quay về 1

        //  Lấy giờ hiện tại của hệ thống
        LocalTime now = LocalTime.now();

        List<TimeSlotProjection> slots = fieldSlotRepository.findSlotsWithPrice(fieldId, date, dayOfWeek,now);

        List<TimeSlotResponse> result =  slots.stream().map(row -> new TimeSlotResponse(
                row.getId(),
                row.getSlotId(),
                row.getStartTime(),
                row.getEndTime(),
                SlotStatus.valueOf(row.getStatus()),
                row.getPrice()
        )).collect(Collectors.toList());

        return result;
    }

    @Transactional
    public void updateSlotForSpecificDate(Integer fieldId, Integer slotId, UpdateSlotSpecificDateRequest request) {
        LocalDate targetDate = LocalDate.parse(request.getDate());

        // 1. Tìm FieldSlot gốc
        FieldSlot fieldSlot = fieldSlotRepository.findByFieldIdAndTimeSlotId(fieldId, slotId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca sân!"));

        // 2. Kiểm tra xem ngày hôm đó đã có cấu hình giá chưa
        FieldSlotPrice fieldSlotPrice = fieldSlotPriceRepository
                .findByFieldSlotIdAndSpecificDate(fieldSlot.getId(), targetDate)
                .orElse(new FieldSlotPrice());

        // 3. Cập nhật thông tin
        fieldSlotPrice.setFieldSlot(fieldSlot);
        fieldSlotPrice.setSpecificDate(targetDate);
        fieldSlotPrice.setPriceType(PriceType.SPECIFIC_DATE);

        if (request.getPrice() != null) {
            fieldSlotPrice.setPrice(request.getPrice());
        }

        fieldSlotPriceRepository.save(fieldSlotPrice);

    }
}
