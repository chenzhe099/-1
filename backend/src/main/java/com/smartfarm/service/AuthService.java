package com.smartfarm.service;

import com.smartfarm.config.JwtTokenProvider;
import com.smartfarm.dto.request.LoginRequest;
import com.smartfarm.dto.response.LoginResponse;
import com.smartfarm.entity.Users;
import com.smartfarm.exception.BadRequestException;
import com.smartfarm.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsersRepository usersRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        Users user = usersRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("用户名或密码错误");
        }

        if ("disabled".equals(user.getStatus())) {
            throw new BadRequestException("账户已被禁用");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .build();
    }
}
