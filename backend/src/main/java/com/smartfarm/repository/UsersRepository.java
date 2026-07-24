package com.smartfarm.repository;

import com.smartfarm.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsersRepository extends JpaRepository<Users, String> {

    Optional<Users> findByUsername(String username);
    List<Users> findByStatus(String status);
    List<Users> findByRole(String role);
    long countByRole(String role);
}