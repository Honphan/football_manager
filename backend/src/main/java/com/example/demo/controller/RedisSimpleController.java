package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/redis")
public class RedisSimpleController {

    @Autowired
    private StringRedisTemplate redisTemplate;

    // 1. LƯU DỮ LIỆU (SET)
    // URL: /api/redis/save?key=name&value=Gemini
    @GetMapping("/save")
    public String save(@RequestParam String key, @RequestParam String value) {
        redisTemplate.opsForValue().set(key, value);
        return "Đã lưu " + key + " = " + value;
    }

//    // 2. LẤY DỮ LIỆU (GET)
//    // URL: /api/redis/get?key=name
//    @GetMapping("/get")
//    public String get(@RequestParam String key) {
//        String value = redisTemplate.opsForValue().get(key);
//        return "Giá trị của " + key + " là: " + (value != null ? value : "Không tồn tại");
//    }


}
