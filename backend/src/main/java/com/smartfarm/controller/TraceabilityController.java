package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/traceability")
@RequiredArgsConstructor
public class TraceabilityController {

    private final ProductsRepository productRepo;
    private final ProductionTimelineRepository timelineRepo;
    private final QualityCertificationsRepository certRepo;
    private final AiClientService aiClient;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> s = new HashMap<>();
        s.put("productCount", productRepo.count());
        s.put("recordCount", timelineRepo.count());
        s.put("scanCount", 5234);
        s.put("certCount", certRepo.count());
        return ApiResponse.ok(s);
    }

    @GetMapping("/products")
    public ApiResponse<List<Products>> getProducts() {
        return ApiResponse.ok(productRepo.findAll());
    }

    @GetMapping("/products/{id}")
    public ApiResponse<Products> getProduct(@PathVariable String id) {
        return ApiResponse.ok(productRepo.findById(id).orElse(null));
    }

    @GetMapping("/products/{id}/timeline")
    public ApiResponse<List<ProductionTimeline>> getTimeline(@PathVariable String id) {
        return ApiResponse.ok(timelineRepo.findByProductId(id));
    }

    @GetMapping("/products/{id}/certifications")
    public ApiResponse<List<QualityCertifications>> getCertifications(@PathVariable String id) {
        return ApiResponse.ok(certRepo.findByProductId(id));
    }

    @PostMapping("/products")
    public ApiResponse<Products> addProduct(@RequestBody Products product) {
        if (product.getId() == null) product.setId("prod_" + System.currentTimeMillis());
        return ApiResponse.ok(productRepo.save(product));
    }

    // ==================== AI 溯源报告生成 ====================

    @PostMapping("/products/{id}/ai-report")
    public ApiResponse<?> generateTraceReport(@PathVariable String id, @RequestBody Map<String, Object> params) {
        params.put("productId", id);
        Map<String, Object> result = aiClient.generateTraceReport(params);
        return ApiResponse.ok(result);
    }
}
