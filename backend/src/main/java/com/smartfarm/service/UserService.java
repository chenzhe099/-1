package com.smartfarm.service;

import com.smartfarm.dto.CreateUserRequest;
import com.smartfarm.dto.UpdateUserRequest;
import com.smartfarm.dto.UserDTO;
import com.smartfarm.entity.User;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户", id));
        return toDTO(user);
    }

    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("用户名已存在");
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .role(request.getRole() != null ? request.getRole() : "farmer")
                .phone(request.getPhone())
                .email(request.getEmail())
                .status("active")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
        return toDTO(user);
    }

    public UserDTO updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户", id));

        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getStatus() != null) user.setStatus(request.getStatus());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getEmail() != null) user.setEmail(request.getEmail());

        userRepository.save(user);
        return toDTO(user);
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("用户", id);
        }
        userRepository.deleteById(id);
    }

    public void resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("用户", id));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public long countByRole(String role) {
        return userRepository.countByRoleAndStatus(role, "active");
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .avatar(user.getAvatar())
                .status(user.getStatus())
                .phone(user.getPhone())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "")
                .build();
    }
}
