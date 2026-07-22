package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "personnel")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Personnel {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "role")
    private String role;

    @Column(name = "status")
    private String status;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "joinedAt")
    private String joinedAt;

    @Column(name = "assignedFields")
    private String assignedFields;

}