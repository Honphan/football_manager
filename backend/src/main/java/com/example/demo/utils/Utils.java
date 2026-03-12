package com.example.demo.utils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class Utils {

    private static long maxAgeInSeconds;
    private static boolean secureCookie;

    @Value("${app.auth.jwt-refresh-expiration-ms}")
    public void setMaxAgeInSeconds(long maxAgeInMs) {
        Utils.maxAgeInSeconds = maxAgeInMs / 1000; // Convert milliseconds to seconds
    }

    @Value("${app.auth.cookie-secure:false}")
    public void setSecureCookie(boolean secure) {
        Utils.secureCookie = secure;
    }

    // Hàm bổ trợ lấy giá trị từ Cookie
    public static String getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Arrays.stream(request.getCookies())
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    public static ResponseCookie generateHttpOnlyCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(secureCookie)  // Now configurable via properties
                .path("/")
                .maxAge(maxAgeInSeconds)
                .sameSite("Strict")
                .build();
    }
}
