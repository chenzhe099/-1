package com.smartfarm.service;

import com.smartfarm.dto.LoginRequest;
import com.smartfarm.dto.LoginResponse;
import com.smartfarm.entity.User;
import com.smartfarm.exception.BusinessException;
import com.smartfarm.repository.UserRepository;
import com.smartfarm.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("用户名或密码错误");
        }

        if ("disabled".equals(user.getStatus())) {
            throw new BusinessException("账户已被禁用，请联系管理员");
        }

        // 更新最后登录时间
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .build();
    }

    public LoginResponse register(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setStatus("active");
        user.setCreatedAt(LocalDateTime.now());

        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("farmer");
        }

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .build();
    }
}
