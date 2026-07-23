package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "yield_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class YieldPredictions {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "`month`")
    private String month;

    @Column(name = "actual")
    private Integer actual;

    @Column(name = "predicted")
    private Double predicted;

    @Column(name = "cropId")
    private String cropId;

}