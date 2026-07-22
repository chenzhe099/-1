package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "operation_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperationLogs {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "action")
    private String action;

    @Column(name = "userId")
    private String userId;

    @Column(name = "username")
    private String username;

    @Column(name = "module")
    private String module;

    @Column(name = "timestamp")
    private String timestamp;

    @Column(name = "details")
    private String details;

}