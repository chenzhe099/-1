package com.smartfarm.repository;

import com.smartfarm.entity.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel, String> {

    List<Personnel> findByStatus(String status);
    List<Personnel> findByRole(String role);
    long countByRole(String role);
}