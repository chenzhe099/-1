package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 权限管理控制器
 * 提供用户管理、角色管理、操作日志查看及密码重置等功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/permission")
@RequiredArgsConstructor
@Tag(name = "权限管理", description = "用户/角色/权限管理及操作日志查询")
public class PermissionController {

    private final UsersRepository userRepo;
    private final RolesRepository roleRepo;
    private final OperationLogsRepository logRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    @Operation(summary = "用户统计", description = "返回用户总数及各角色数量统计")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> s = new HashMap<>();
        s.put("totalUsers", userRepo.count());
        s.put("adminCount", userRepo.countByRole("admin"));
        s.put("technicianCount", userRepo.countByRole("technician"));
        s.put("farmerCount", userRepo.countByRole("farmer"));
        return ApiResponse.ok(s);
    }

    // ==================== 用户管理 ====================

    @GetMapping("/users")
    @Operation(summary = "获取用户列表", description = "返回所有用户信息")
    public ApiResponse<List<Users>> getUsers() {
        return ApiResponse.ok(userRepo.findAll());
    }

    @PostMapping("/users")
    @Transactional
    @Operation(summary = "新增用户", description = "创建用户，密码默认加密为 123456")
    public ApiResponse<Users> addUser(@RequestBody Users user) {
        if (user.getId() == null) user.setId("u_" + System.currentTimeMillis());
        if (user.getPassword() == null) user.setPassword(passwordEncoder.encode("123456"));
        else user.setPassword(passwordEncoder.encode(user.getPassword()));
        Users saved = userRepo.save(user);
        log.info("新增用户: id={}, username={}", saved.getId(), saved.getUsername());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/users/{id}")
    @Transactional
    @Operation(summary = "更新用户", description = "根据 ID 更新用户信息（保留原密码）")
    public ApiResponse<Users> editUser(@PathVariable String id, @RequestBody Users user) {
        userRepo.findById(id).ifPresent(existing -> {
            user.setId(id);
            user.setPassword(existing.getPassword());
            userRepo.save(user);
            log.info("更新用户: id={}", id);
        });
        return ApiResponse.ok(userRepo.findById(id).orElse(null));
    }

    @PutMapping("/users/{id}/reset-password")
    @Transactional
    @Operation(summary = "重置密码", description = "将指定用户的密码重置为 123456")
    public ApiResponse<?> resetPassword(@PathVariable String id) {
        userRepo.findById(id).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("123456"));
            userRepo.save(u);
            log.info("重置密码: id={}", id);
        });
        return ApiResponse.ok("密码已重置", null);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    @Operation(summary = "禁用用户", description = "将指定用户的状态设为 disabled（软禁用）")
    public ApiResponse<?> disableUser(@PathVariable String id) {
        userRepo.findById(id).ifPresent(u -> {
            u.setStatus("disabled");
            userRepo.save(u);
            log.info("禁用用户: id={}", id);
        });
        return ApiResponse.ok("用户已禁用", null);
    }

    // ==================== 角色管理 ====================

    @GetMapping("/roles")
    @Operation(summary = "获取角色列表", description = "返回所有角色定义")
    public ApiResponse<List<Roles>> getRoles() {
        return ApiResponse.ok(roleRepo.findAll());
    }

    @PostMapping("/roles")
    @Transactional
    @Operation(summary = "新增角色", description = "创建新的角色定义")
    public ApiResponse<Roles> addRole(@RequestBody Roles role) {
        if (role.getId() == null) role.setId("r_" + System.currentTimeMillis());
        Roles saved = roleRepo.save(role);
        log.info("新增角色: id={}, name={}", saved.getId(), saved.getName());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/roles/{id}")
    @Transactional
    @Operation(summary = "更新角色", description = "根据 ID 更新角色定义")
    public ApiResponse<Roles> updateRole(@PathVariable String id, @RequestBody Roles role) {
        role.setId(id);
        Roles saved = roleRepo.save(role);
        log.info("更新角色: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/roles/{id}")
    @Transactional
    @Operation(summary = "删除角色", description = "根据 ID 删除指定角色")
    public ApiResponse<?> deleteRole(@PathVariable String id) {
        roleRepo.deleteById(id);
        log.info("删除角色: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 操作日志 ====================

    @GetMapping("/logs")
    @Operation(summary = "获取操作日志", description = "返回所有操作日志记录")
    public ApiResponse<List<OperationLogs>> getLogs() {
        return ApiResponse.ok(logRepo.findAll());
    }
}
