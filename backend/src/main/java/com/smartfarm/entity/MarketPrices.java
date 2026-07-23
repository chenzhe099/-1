package com.smartfarm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "market_prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketPrices {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "cropName")
    private String cropName;

    @Column(name = "pricePerKg")
    private Double pricePerKg;

    @Column(name = "unit")
    private String unit;

    @Column(name = "market")
    private String market;

    @Column(name = "date")
    private String date;

    @Column(name = "changePercent")
    private Double changePercent;

    @Column(name = "trend")
    private String trend;

}