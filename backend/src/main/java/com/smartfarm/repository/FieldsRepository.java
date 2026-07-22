package com.smartfarm.repository;

import com.smartfarm.entity.Fields;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FieldsRepository extends JpaRepository<Fields, String> {

    List<Fields> findByStatus(String status);
    List<Fields> findByCropId(String cropId);
}