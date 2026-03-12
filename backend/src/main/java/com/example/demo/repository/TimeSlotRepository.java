package com.example.demo.repository;

import com.example.demo.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, Integer> {
}
