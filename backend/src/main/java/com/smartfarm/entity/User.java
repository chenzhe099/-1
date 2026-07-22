package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50)
    private String username;

    @Column(length = 200)
    private String passwordHash;

    @Column(length = 100)
    private String displayName;

    @Column(length = 20)
    private String role;

    @Column(length = 200)
    private String avatar;

    @Column(length = 20)
    private String status;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String email;

    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;
}
