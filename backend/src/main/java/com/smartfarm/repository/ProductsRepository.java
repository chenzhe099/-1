package com.smartfarm.repository;

import com.smartfarm.entity.Products;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductsRepository extends JpaRepository<Products, String> {

    List<Products> findByFieldId(String fieldId);
    List<Products> findByCropId(String cropId);
}