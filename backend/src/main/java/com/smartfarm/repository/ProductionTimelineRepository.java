package com.smartfarm.repository;

import com.smartfarm.entity.ProductionTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionTimelineRepository extends JpaRepository<ProductionTimeline, String> {

    List<ProductionTimeline> findByProductId(String productId);
    List<ProductionTimeline> findByDateContaining(String date);
}