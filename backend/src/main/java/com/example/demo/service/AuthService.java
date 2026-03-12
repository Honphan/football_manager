package com.example.demo.service;

import com.example.demo.config.JwtTokenProvider;
import com.example.demo.dto.JwtResponse;
import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.RegisterRequest;
import com.example.demo.dto.UserResponse;
import com.example.demo.entity.RefreshToken;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.enums.RoleName;
import com.example.demo.repository.RefreshTokenRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.utils.Utils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;


    public UserResponse registerUser(RegisterRequest request) {
        // 1. Kiểm tra username đã tồn tại chưa
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException(" Tên đăng nhập đã tồn tại!");
        }

        // 3. Lấy quyền ROLE_USER mặc định cho khách đăng ký
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new RuntimeException(" Không tìm thấy quyền USER trong hệ thống"));

        // 4. Tạo đối tượng User và mã hóa mật khẩu
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // HASH PASSWORD
        user.setRole(userRole);
        user.setIsActive(true);

        // 5. Lưu xuống Database
        User savedUser = userRepository.save(user);

        // 6. Chuyển đổi sang Response DTO để trả về cho Frontend
        return UserResponse.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .build();
    }

    public JwtResponse loginForUser(LoginRequest request, HttpServletResponse response) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (!user.getRole().getName().equals(RoleName.ROLE_USER)) {
            throw new RuntimeException("Bạn không có quyền truy cập vào cổng này!");
        }

        if(!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            throw new RuntimeException("Mật khẩu đăng nhập bị sai");
        }

        // 3. Cấu hình HttpOnly Cookie
        String refreshToken = jwtTokenProvider.createRefreshToken(user);
        String jwtToken = jwtTokenProvider.generateToken(user);

        ResponseCookie resCookie = Utils.generateHttpOnlyCookie(refreshToken);

        response.addHeader(HttpHeaders.SET_COOKIE, resCookie.toString());

        return new JwtResponse(jwtToken,user.getUsername(),user.getRole().getName().name());
    }

    public JwtResponse loginForAdmin(RegisterRequest request,HttpServletResponse response){
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (!user.getRole().getName().equals(RoleName.ROLE_ADMIN)) {
            throw new RuntimeException("Bạn không có quyền truy cập vào cổng này!");
        }

        if(!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            throw new RuntimeException("Mật khẩu đăng nhập bị sai");
        }

        // 3. Cấu hình HttpOnly Cookie
        String refreshToken = jwtTokenProvider.createRefreshToken(user);
        String jwtToken = jwtTokenProvider.generateToken(user);

        ResponseCookie resCookie = Utils.generateHttpOnlyCookie(refreshToken);

        response.addHeader(HttpHeaders.SET_COOKIE, resCookie.toString());

        return new JwtResponse(jwtToken,user.getUsername(),user.getRole().getName().name());
    }

    public JwtResponse refreshAccessToken(String token) {
        // 1. Kiểm tra Refresh Token có tồn tại và còn hạn không
        RefreshToken refreshToken = jwtTokenProvider.verifyExpiration(token);

        // 2. Lấy thông tin User từ Refresh Token
        User user = refreshToken.getUser();

        // 3. Tạo Access Token mới (JWT) trả về cho Body
        String newAccessToken = jwtTokenProvider.generateToken(user);

        return new JwtResponse(newAccessToken, user.getUsername(), user.getRole().getName().name());
    }


}
