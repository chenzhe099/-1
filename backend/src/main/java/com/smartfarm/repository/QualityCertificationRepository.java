package com.smartfarm.repository;

import com.smartfarm.entity.QualityCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityCertificationRepository extends JpaRepository<QualityCertification, Long> {

    List<QualityCertification> findByProductId(Long productId);
}
