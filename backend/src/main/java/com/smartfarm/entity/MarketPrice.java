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
@Table(name = "market_prices")
public class MarketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String cropName;

    private Double pricePerKg;

    @Column(length = 20)
    private String unit;

    @Column(length = 100)
    private String market;

    private LocalDate date;

    private Double changePercent;

    @Column(length = 20)
    private String trend;
}
