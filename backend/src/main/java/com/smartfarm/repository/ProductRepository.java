package com.smartfarm.repository;

import com.smartfarm.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByFieldId(Long fieldId);

    List<Product> findByTraceStatus(String status);
}
