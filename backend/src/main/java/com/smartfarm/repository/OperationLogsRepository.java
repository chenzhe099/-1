package com.smartfarm.repository;

import com.smartfarm.entity.OperationLogs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OperationLogsRepository extends JpaRepository<OperationLogs, String> {

    Optional<OperationLogs> findByUsername(String username);
    List<OperationLogs> findByUserId(String userId);
}