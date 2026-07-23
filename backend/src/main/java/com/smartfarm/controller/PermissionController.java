package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/permission")
@RequiredArgsConstructor
public class PermissionController {

    private final UsersRepository userRepo;
    private final RolesRepository roleRepo;
    private final OperationLogsRepository logRepo;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> s = new HashMap<>();
        s.put("totalUsers", userRepo.count());
        s.put("adminCount", userRepo.countByRole("admin"));
        s.put("technicianCount", userRepo.countByRole("technician"));
        s.put("farmerCount", userRepo.countByRole("farmer"));
        return ApiResponse.ok(s);
    }

    @GetMapping("/users")
    public ApiResponse<List<Users>> getUsers() {
        return ApiResponse.ok(userRepo.findAll());
    }

    @PostMapping("/users")
    public ApiResponse<Users> addUser(@RequestBody Users user) {
        if (user.getId() == null) user.setId("u_" + System.currentTimeMillis());
        if (user.getPassword() == null) user.setPassword(passwordEncoder.encode("123456"));
        else user.setPassword(passwordEncoder.encode(user.getPassword()));
        return ApiResponse.ok(userRepo.save(user));
    }

    @PutMapping("/users/{id}")
    public ApiResponse<Users> editUser(@PathVariable String id, @RequestBody Users user) {
        userRepo.findById(id).ifPresent(existing -> {
            user.setId(id);
            user.setPassword(existing.getPassword());
            userRepo.save(user);
        });
        return ApiResponse.ok(userRepo.findById(id).orElse(null));
    }

    @PutMapping("/users/{id}/reset-password")
    public ApiResponse<?> resetPassword(@PathVariable String id) {
        userRepo.findById(id).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode("123456"));
            userRepo.save(u);
        });
        return ApiResponse.ok("密码已重置", null);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<?> disableUser(@PathVariable String id) {
        userRepo.findById(id).ifPresent(u -> {
            u.setStatus("disabled");
            userRepo.save(u);
        });
        return ApiResponse.ok("用户已禁用", null);
    }

    @GetMapping("/roles")
    public ApiResponse<List<Roles>> getRoles() {
        return ApiResponse.ok(roleRepo.findAll());
    }

    @GetMapping("/logs")
    public ApiResponse<List<OperationLogs>> getLogs() {
        return ApiResponse.ok(logRepo.findAll());
    }
}
