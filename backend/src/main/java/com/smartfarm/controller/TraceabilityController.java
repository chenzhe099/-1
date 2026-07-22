package com.smartfarm.controller;

import com.smartfarm.dto.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.service.TraceabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/traceability")
@RequiredArgsConstructor
@Tag(name = "溯源管理", description = "农产品全流程追溯与认证管理")
public class TraceabilityController {

    private final TraceabilityService traceService;

    @GetMapping("/stats")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.success(traceService.getTraceStats());
    }

    @GetMapping("/products")
    @Operation(summary = "获取所有产品")
    public ApiResponse<List<Product>> getAllProducts() {
        return ApiResponse.success(traceService.getAllProducts());
    }

    @GetMapping("/products/{id}")
    public ApiResponse<Product> getProduct(@PathVariable Long id) {
        return ApiResponse.success(traceService.getProductById(id));
    }

    @PostMapping("/products")
    public ApiResponse<Product> createProduct(@RequestBody Product product) {
        return ApiResponse.success(traceService.createProduct(product));
    }

    @PutMapping("/products/{id}")
    public ApiResponse<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ApiResponse.success(traceService.updateProduct(id, product));
    }

    @DeleteMapping("/products/{id}")
    public ApiResponse<Void> deleteProduct(@PathVariable Long id) {
        traceService.deleteProduct(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/products/{id}/timeline")
    @Operation(summary = "获取产品生产时间线")
    public ApiResponse<List<ProductionTimeline>> getTimeline(@PathVariable Long id) {
        return ApiResponse.success(traceService.getTimeline(id));
    }

    @PostMapping("/timeline")
    public ApiResponse<ProductionTimeline> addTimeline(@RequestBody ProductionTimeline entry) {
        return ApiResponse.success(traceService.addTimelineEntry(entry));
    }

    @GetMapping("/products/{id}/certifications")
    @Operation(summary = "获取产品质检认证")
    public ApiResponse<List<QualityCertification>> getCertifications(@PathVariable Long id) {
        return ApiResponse.success(traceService.getCertifications(id));
    }

    @PostMapping("/certifications")
    public ApiResponse<QualityCertification> addCert(@RequestBody QualityCertification cert) {
        return ApiResponse.success(traceService.addCertification(cert));
    }

    @PostMapping("/products/{id}/trace-code")
    @Operation(summary = "生成溯源码")
    public ApiResponse<String> generateTraceCode(@PathVariable Long id) {
        return ApiResponse.success(traceService.generateTraceCode(id));
    }
}
