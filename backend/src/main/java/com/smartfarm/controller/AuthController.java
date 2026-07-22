package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.dto.LoginRequest;
import com.smartfarm.dto.LoginResponse;
import com.smartfarm.entity.User;
import com.smartfarm.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "认证管理", description = "用户登录、注册接口")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "使用用户名和密码登录，返回JWT令牌")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("登录成功", authService.login(request));
    }

    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "注册新用户，默认角色为农户")
    public ApiResponse<LoginResponse> register(@Valid @RequestBody User user) {
        return ApiResponse.success("注册成功", authService.register(user));
    }
}
