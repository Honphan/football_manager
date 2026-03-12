package com.example.demo.config.vnpay;

import com.example.demo.service.BookService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
public class VnPayController {

    private final BookService bookService;
    private final VnPayProperties vnPayProperties;

    @GetMapping("/ipn")
    public ResponseEntity<?> processIpn(HttpServletRequest request) {
        // Lấy toàn bộ tham số từ VNPAY gửi sang
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                fields.put(fieldName, fieldValue);
            }
        }

        //  Kiểm tra chữ ký bảo mật (Checksum)
        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        String signValue = VnPayUtil.hashAllFields(fields, vnPayProperties.getHashSecret());

        if (vnp_SecureHash.equals(signValue)) {
            String responseCode = fields.get("vnp_ResponseCode");
            Integer bookingId = Integer.parseInt(fields.get("vnp_TxnRef"));

            if ("00".equals(responseCode)) {
                bookService.confirmBooking(bookingId);
                return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
            } else {
                bookService.cancelBooking(bookingId);
                return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Payment Failed/Cancelled Updated"));
            }
        } else {return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum"));
        }
    }
}
