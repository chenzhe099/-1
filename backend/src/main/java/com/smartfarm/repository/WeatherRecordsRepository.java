package com.smartfarm.repository;

import com.smartfarm.entity.WeatherRecords;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherRecordsRepository extends JpaRepository<WeatherRecords, String> {

    List<WeatherRecords> findByDateContaining(String date);
}