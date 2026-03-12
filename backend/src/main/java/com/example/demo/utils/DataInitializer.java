package com.example.demo.utils;

import com.example.demo.entity.User;
import com.example.demo.enums.RoleName;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra nếu chưa có admin thì mới tạo
        if (userRepository.findByUsername("0123456789").isEmpty()) {
            User admin = new User();
            admin.setUsername("0123456789");
            admin.setPassword(passwordEncoder.encode("1")); // Mật khẩu mặc định
            admin.setRole(roleRepository.findByName(RoleName.ROLE_ADMIN).get());
            userRepository.save(admin);
            System.out.println(" Đã khởi tạo tài khoản Admin mặc định.");
        }
    }
}
