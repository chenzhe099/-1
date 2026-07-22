package com.smartfarm.repository;

import com.smartfarm.entity.Personnel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonnelRepository extends JpaRepository<Personnel, Long> {

    List<Personnel> findByStatus(String status);
}
