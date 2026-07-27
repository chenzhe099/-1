package com.smartfarm.controller;

import com.smartfarm.config.JwtTokenProvider;
import com.smartfarm.dto.request.LoginRequest;
import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.dto.response.LoginResponse;
import com.smartfarm.entity.Users;
import com.smartfarm.repository.UsersRepository;
import com.smartfarm.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 认证授权控制器
 * 提供用户登录、获取当前用户信息等功能
 */
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "认证授权", description = "用户登录、获取当前用户信息等认证接口")
public class AuthController {

    private final AuthService authService;
    private final UsersRepository usersRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "使用用户名和密码登录，返回 JWT Token")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "获取当前用户", description = "获取当前登录用户的信息（通过 JWT 认证）")
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
