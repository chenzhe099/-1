package com.smartfarm.repository;

import com.smartfarm.entity.ProductionTimeline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionTimelineRepository extends JpaRepository<ProductionTimeline, Long> {

    List<ProductionTimeline> findByProductIdOrderByDateAsc(Long productId);
}
