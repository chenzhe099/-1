package com.smartfarm.repository;

import com.smartfarm.entity.YieldPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface YieldPredictionRepository extends JpaRepository<YieldPrediction, Long> {

    List<YieldPrediction> findByMonthBetween(String startMonth, String endMonth);

    Optional<YieldPrediction> findByMonth(String month);
}
