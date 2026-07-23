package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "farms")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farms {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "address")
    private String address;

    @Column(name = "managerId")
    private String managerId;

    @Column(name = "area")
    private Double area;

    @Column(name = "establishedDate")
    private String establishedDate;

    @Column(name = "description")
    private String description;

}