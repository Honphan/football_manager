package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(min = 10, max = 10, message = "Số điện thoại phải gồm 10 chữ số")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 1, message = "Mật khẩu phải có ít nhất 1 ký tự")
    private String password;

}