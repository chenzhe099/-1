package com.smartfarm.repository;

import com.smartfarm.entity.QualityCertifications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QualityCertificationsRepository extends JpaRepository<QualityCertifications, String> {

    List<QualityCertifications> findByProductId(String productId);
}