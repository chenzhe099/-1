package com.smartfarm.repository;

import com.smartfarm.entity.WeatherRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeatherRecordRepository extends JpaRepository<WeatherRecord, Long> {

    List<WeatherRecord> findByDateBetweenOrderByDateAsc(LocalDate start, LocalDate end);

    Optional<WeatherRecord> findTop1ByOrderByDateDesc();
}
