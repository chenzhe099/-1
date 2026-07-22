package com.smartfarm.repository;

import com.smartfarm.entity.Farms;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FarmsRepository extends JpaRepository<Farms, String> {

}