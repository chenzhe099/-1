package com.smartfarm.repository;

import com.smartfarm.entity.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {

    List<MarketPrice> findByCropNameAndDateBetweenOrderByDateAsc(String crop, LocalDate start, LocalDate end);

    List<MarketPrice> findByDate(LocalDate date);

    @Query("SELECT DISTINCT m.cropName FROM MarketPrice m")
    List<String> findDistinctCropName();
}
