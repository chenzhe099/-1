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
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    private String severity;

    @Column(length = 50)
    private String module;

    @Builder.Default
    private Boolean isResolved = false;

    @Builder.Default
    private Boolean isRead = false;

    private LocalDateTime createdAt;

    @Column(length = 200)
    private String actionRequired;
}
