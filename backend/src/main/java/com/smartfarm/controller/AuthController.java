package com.smartfarm.controller;

import com.smartfarm.config.JwtTokenProvider;
import com.smartfarm.dto.request.LoginRequest;
import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.dto.response.LoginResponse;
import com.smartfarm.entity.Users;
import com.smartfarm.repository.UsersRepository;
import com.smartfarm.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UsersRepository usersRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ApiResponse<Map<String, Object>> me(@AuthenticationPrincipal Users user) {
        if (user == null) {
            return ApiResponse.fail(401, "未登录");
        }
        return ApiResponse.ok(Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "displayName", user.getDisplayName(),
            "role", user.getRole(),
            "status", user.getStatus()
        ));
    }
}
