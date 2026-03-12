package com.example.demo.repository;

import com.example.demo.entity.FieldSlotPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Optional;

@RestController
public interface FieldSlotPriceRepository extends JpaRepository<FieldSlotPrice, Integer> {

    Optional<FieldSlotPrice> findByFieldSlotIdAndSpecificDate(Integer fieldSlotId, LocalDate specificDate);
}
