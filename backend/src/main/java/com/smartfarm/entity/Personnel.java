package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "personnel")
public class Personnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50)
    private String name;

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

    private LocalDate joinedAt;
}
