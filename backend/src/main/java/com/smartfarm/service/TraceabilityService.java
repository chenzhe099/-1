package com.smartfarm.service;

import com.smartfarm.entity.*;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TraceabilityService {

    private final ProductRepository productRepo;
    private final ProductionTimelineRepository timelineRepo;
    private final QualityCertificationRepository certRepo;

    public Map<String, Object> getTraceStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("productCount", productRepo.count());
        stats.put("timelineCount", timelineRepo.count());
        stats.put("certCount", certRepo.count());
        stats.put("scanCount", 5234);
        return stats;
    }

    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    public Product getProductById(Long id) {
        return productRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("产品", id));
    }

    public Product createProduct(Product product) {
        if (product.getTraceStatus() == null) product.setTraceStatus("pending_trace");
        return productRepo.save(product);
    }

    public Product updateProduct(Long id, Product updated) {
        Product p = productRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("产品", id));
        if (updated.getName() != null) p.setName(updated.getName());
        if (updated.getTraceStatus() != null) p.setTraceStatus(updated.getTraceStatus());
        return productRepo.save(p);
    }

    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }

    public List<ProductionTimeline> getTimeline(Long productId) {
        return timelineRepo.findByProductIdOrderByDateAsc(productId);
    }

    public ProductionTimeline addTimelineEntry(ProductionTimeline entry) {
        return timelineRepo.save(entry);
    }

    public List<QualityCertification> getCertifications(Long productId) {
        return certRepo.findByProductId(productId);
    }

    public QualityCertification addCertification(QualityCertification cert) {
        return certRepo.save(cert);
    }

    public String generateTraceCode(Long productId) {
        Product p = productRepo.findById(productId).orElseThrow(() -> new ResourceNotFoundException("产品", productId));
        return "TR" + p.getBatchNumber() + System.currentTimeMillis() % 100000;
    }
}
