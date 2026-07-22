package com.smartfarm.repository;

import com.smartfarm.entity.ModelVersions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModelVersionsRepository extends JpaRepository<ModelVersions, String> {

    List<ModelVersions> findByStatus(String status);
}