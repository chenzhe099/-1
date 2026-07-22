package com.smartfarm.repository;

import com.smartfarm.entity.YieldPredictions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface YieldPredictionsRepository extends JpaRepository<YieldPredictions, String> {

    List<YieldPredictions> findByCropId(String cropId);
}