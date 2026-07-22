package com.smartfarm.repository;

import com.smartfarm.entity.Devices;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DevicesRepository extends JpaRepository<Devices, String> {

    List<Devices> findByStatus(String status);
}