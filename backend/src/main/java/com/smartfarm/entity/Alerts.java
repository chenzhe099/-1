package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alerts {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "type")
    private String type;

    @Column(name = "title")
    private String title;

    @Column(name = "message")
    private String message;

    @Column(name = "severity")
    private String severity;

    @Column(name = "fieldId")
    private String fieldId;

    @Column(name = "isRead")
    private Boolean isRead;

    @Column(name = "isResolved")
    private Boolean isResolved;

    @Column(name = "createdAt")
    private String createdAt;

    @Column(name = "actionRequired")
    private String actionRequired;

}