package com.smartfarm.controller;

import com.smartfarm.dto.*;
import com.smartfarm.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "用户CRUD操作")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "获取所有用户")
    public ApiResponse<List<UserDTO>> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取用户详情")
    public ApiResponse<UserDTO> getUser(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "创建用户（管理员）")
    public ApiResponse<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ApiResponse.success("用户创建成功", userService.createUser(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "更新用户（管理员）")
    public ApiResponse<UserDTO> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return ApiResponse.success("用户更新成功", userService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "删除用户（管理员）")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("用户已删除", null);
    }

    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "重置密码（管理员）")
    public ApiResponse<Void> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        userService.resetPassword(id, body.get("newPassword"));
        return ApiResponse.success("密码已重置", null);
    }
}
