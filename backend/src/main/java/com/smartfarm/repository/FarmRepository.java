package com.smartfarm.repository;

import com.smartfarm.entity.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmRepository extends JpaRepository<Farm, Long> {

    List<Farm> findByManagerId(Long managerId);
}
