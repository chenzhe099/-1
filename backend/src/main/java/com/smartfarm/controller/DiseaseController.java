package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.DiseaseRecords;
import com.smartfarm.entity.PestKnowledgeBase;
import com.smartfarm.repository.DiseaseRecordsRepository;
import com.smartfarm.repository.PestKnowledgeBaseRepository;
import com.smartfarm.service.AiClientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * 病虫害管理控制器
 * 提供病虫害记录、知识库检索、AI 图片诊断及趋势分析功能
 */
@RestController
@RequestMapping("/api/v1/disease")
@RequiredArgsConstructor
@Tag(name = "病虫害管理", description = "病虫害记录、知识库、AI 图片诊断及趋势分析")
public class DiseaseController {

    private final DiseaseRecordsRepository diseaseRepo;
    private final PestKnowledgeBaseRepository knowledgeRepo;
    private final AiClientService aiClient;

    @GetMapping("/records")
    @Operation(summary = "获取病虫害记录", description = "返回所有病虫害诊断记录")
    public ApiResponse<List<DiseaseRecords>> getRecords() {
        return ApiResponse.ok(diseaseRepo.findAll());
    }

    @GetMapping("/knowledge")
    @Operation(summary = "获取病虫害知识库", description = "返回病虫害知识库中的所有条目")
    public ApiResponse<List<PestKnowledgeBase>> getKnowledge() {
        return ApiResponse.ok(knowledgeRepo.findAll());
    }

    @GetMapping("/knowledge/search")
    @Operation(summary = "搜索病虫害知识", description = "根据名称关键词搜索病虫害知识库")
    public ApiResponse<?> searchKnowledge(
            @Parameter(description = "病虫害名称关键词") @RequestParam String name) {
        return ApiResponse.ok(knowledgeRepo.findAll().stream()
                .filter(k -> k.getName() != null && k.getName().contains(name))
                .findFirst().orElse(null));
    }

    @PostMapping("/diagnose")
    @Operation(summary = "AI 图片诊断", description = "上传作物病害图片，调用 AI 模型进行病虫害诊断")
    public ApiResponse<?> diagnose(
            @Parameter(description = "作物病害图片文件") @RequestParam("file") MultipartFile file,
            @Parameter(description = "AI 模型名称（deepseek/gpt-4o/claude/gemini/local）") @RequestParam(value = "model", defaultValue = "deepseek") String model) {
        Map<String, Object> result = aiClient.diagnoseDisease(file, model);
        return ApiResponse.ok(result);
    }

    // ==================== AI RAG 知识库检索 ====================

    @PostMapping("/rag/search")
    @Operation(summary = "AI 知识库检索", description = "基于 RAG 技术检索知识库并调用 AI 回答农业技术问题")
    public ApiResponse<?> ragSearch(@RequestBody Map<String, Object> params) {
        String query = (String) params.getOrDefault("query", "");
        int topK = params.containsKey("topK") ? ((Number) params.get("topK")).intValue() : 5;
        Map<String, Object> result = aiClient.ragSearch(query, topK);
        return ApiResponse.ok(result);
    }

    @GetMapping("/trend")
    @Operation(summary = "病虫害趋势", description = "返回病虫害发生趋势数据（按时间统计病害/虫害数量）")
    public ApiResponse<Map<String, Object>> getTrend() {
        List<DiseaseRecords> records = diseaseRepo.findAll();
        Map<String, Object> trend = new LinkedHashMap<>();
        List<String> labels = new ArrayList<>();
        List<Integer> disease = new ArrayList<>();
        List<Integer> pest = new ArrayList<>();
        for (DiseaseRecords r : records) {
            if (r.getDetectedAt() != null) {
                labels.add(r.getDetectedAt().substring(0, Math.min(10, r.getDetectedAt().length())));
                disease.add(r.getDiseaseName() != null && r.getDiseaseName().contains("病") ? 1 : 0);
                pest.add(r.getDiseaseName() != null && r.getDiseaseName().contains("虫") ? 1 : 0);
            }
        }
        trend.put("labels", labels);
        trend.put("disease", disease.stream().mapToInt(Integer::intValue).boxed().toList());
        trend.put("pest", pest.stream().mapToInt(Integer::intValue).boxed().toList());
        return ApiResponse.ok(trend);
    }
}
