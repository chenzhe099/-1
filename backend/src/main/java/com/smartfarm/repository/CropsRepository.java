package com.smartfarm.repository;

import com.smartfarm.entity.Crops;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CropsRepository extends JpaRepository<Crops, String> {

}