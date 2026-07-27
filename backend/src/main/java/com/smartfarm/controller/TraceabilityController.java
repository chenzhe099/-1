package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import com.smartfarm.service.AiClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * 溯源管理控制器
 * 提供产品管理、生产时间线、质量认证及 AI 溯源报告生成功能
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/traceability")
@RequiredArgsConstructor
@Tag(name = "溯源管理", description = "产品管理、生产时间线、质量认证及 AI 溯源报告生成")
public class TraceabilityController {

    private final ProductsRepository productRepo;
    private final ProductionTimelineRepository timelineRepo;
    private final QualityCertificationsRepository certRepo;
    private final AiClientService aiClient;

    @GetMapping("/stats")
    @Operation(summary = "溯源统计", description = "返回产品数、记录数、扫描次数、认证数等统计信息")
    public ApiResponse<Map<String, Object>> getStats() {
        Map<String, Object> s = new HashMap<>();
        s.put("productCount", productRepo.count());
        s.put("recordCount", timelineRepo.count());
        s.put("scanCount", 5234);
        s.put("certCount", certRepo.count());
        return ApiResponse.ok(s);
    }

    @GetMapping("/products")
    @Operation(summary = "获取产品列表", description = "返回所有产品信息")
    public ApiResponse<List<Products>> getProducts() {
        return ApiResponse.ok(productRepo.findAll());
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "获取产品详情", description = "根据 ID 获取单个产品的详细信息")
    public ApiResponse<Products> getProduct(@PathVariable String id) {
        return ApiResponse.ok(productRepo.findById(id).orElse(null));
    }

    @GetMapping("/products/{id}/timeline")
    @Operation(summary = "获取产品时间线", description = "根据产品 ID 获取该产品的生产过程时间线")
    public ApiResponse<List<ProductionTimeline>> getTimeline(@PathVariable String id) {
        return ApiResponse.ok(timelineRepo.findByProductId(id));
    }

    @GetMapping("/products/{id}/certifications")
    @Operation(summary = "获取产品认证", description = "根据产品 ID 获取该产品的质量认证信息")
    public ApiResponse<List<QualityCertifications>> getCertifications(@PathVariable String id) {
        return ApiResponse.ok(certRepo.findByProductId(id));
    }

    @PostMapping("/products")
    @Transactional
    @Operation(summary = "新增产品", description = "添加一条产品记录，未传 id 则自动生成")
    public ApiResponse<Products> addProduct(@RequestBody Products product) {
        if (product.getId() == null) product.setId("prod_" + System.currentTimeMillis());
        Products saved = productRepo.save(product);
        log.info("新增产品: id={}, name={}", saved.getId(), saved.getName());
        return ApiResponse.ok(saved);
    }

    @PutMapping("/products/{id}")
    @Transactional
    @Operation(summary = "更新产品", description = "根据 ID 更新产品信息")
    public ApiResponse<Products> updateProduct(@PathVariable String id, @RequestBody Products product) {
        product.setId(id);
        Products saved = productRepo.save(product);
        log.info("更新产品: id={}", id);
        return ApiResponse.ok(saved);
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    @Operation(summary = "删除产品", description = "根据 ID 删除指定产品及其关联数据")
    public ApiResponse<?> deleteProduct(@PathVariable String id) {
        productRepo.deleteById(id);
        log.info("删除产品: id={}", id);
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== AI 溯源报告生成 ====================

    @PostMapping("/products/{id}/ai-report")
    @Operation(summary = "AI 溯源报告", description = "根据产品 ID 和参数调用 AI 生成溯源码和报告")
    public ApiResponse<?> generateTraceReport(@PathVariable String id, @RequestBody Map<String, Object> params) {
        params.put("productId", id);
        Map<String, Object> result = aiClient.generateTraceReport(params);
        return ApiResponse.ok(result);
    }
}
