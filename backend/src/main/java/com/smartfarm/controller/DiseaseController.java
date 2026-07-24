package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import com.smartfarm.entity.DiseaseRecords;
import com.smartfarm.entity.PestKnowledgeBase;
import com.smartfarm.repository.DiseaseRecordsRepository;
import com.smartfarm.repository.PestKnowledgeBaseRepository;
import com.smartfarm.service.AiClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/v1/disease")
@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseRecordsRepository diseaseRepo;
    private final PestKnowledgeBaseRepository knowledgeRepo;
    private final AiClientService aiClient;

    @GetMapping("/records")
    public ApiResponse<List<DiseaseRecords>> getRecords() {
        return ApiResponse.ok(diseaseRepo.findAll());
    }

    @GetMapping("/knowledge")
    public ApiResponse<List<PestKnowledgeBase>> getKnowledge() {
        return ApiResponse.ok(knowledgeRepo.findAll());
    }

    @GetMapping("/knowledge/search")
    public ApiResponse<?> searchKnowledge(@RequestParam String name) {
        return ApiResponse.ok(knowledgeRepo.findAll().stream()
                .filter(k -> k.getName() != null && k.getName().contains(name))
                .findFirst().orElse(null));
    }

    @PostMapping("/diagnose")
    public ApiResponse<?> diagnose(@RequestParam("file") MultipartFile file,
                                   @RequestParam(value = "model", defaultValue = "deepseek") String model) {
        Map<String, Object> result = aiClient.diagnoseDisease(file, model);
        return ApiResponse.ok(result);
    }

    // ==================== AI RAG 知识库检索 ====================

    @PostMapping("/rag/search")
    public ApiResponse<?> ragSearch(@RequestBody Map<String, Object> params) {
        String query = (String) params.getOrDefault("query", "");
        int topK = params.containsKey("topK") ? ((Number) params.get("topK")).intValue() : 5;
        Map<String, Object> result = aiClient.ragSearch(query, topK);
        return ApiResponse.ok(result);
    }

    @GetMapping("/trend")
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
