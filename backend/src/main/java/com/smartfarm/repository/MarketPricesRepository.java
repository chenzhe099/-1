package com.smartfarm.repository;

import com.smartfarm.entity.MarketPrices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MarketPricesRepository extends JpaRepository<MarketPrices, String> {

    List<MarketPrices> findByDateContaining(String date);
}