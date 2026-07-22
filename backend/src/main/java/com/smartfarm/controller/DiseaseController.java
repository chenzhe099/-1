package com.smartfarm.controller;

import com.smartfarm.dto.*;
import com.smartfarm.entity.*;
import com.smartfarm.service.DiseaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/disease")
@RequiredArgsConstructor
@Tag(name = "病虫害识别", description = "AI病虫害识别、知识库与防治建议")
public class DiseaseController {

    private final DiseaseService diseaseService;

    @GetMapping("/records")
    @Operation(summary = "获取病虫害记录")
    public ApiResponse<List<DiseaseRecordDTO>> getRecords() {
        return ApiResponse.success(diseaseService.getAllRecords());
    }

    @GetMapping("/records/{id}")
    public ApiResponse<DiseaseRecordDTO> getRecord(@PathVariable Long id) {
        return ApiResponse.success(diseaseService.getRecordById(id));
    }

    @PostMapping("/records")
    @Operation(summary = "创建病虫害识别记录")
    public ApiResponse<DiseaseRecordDTO> createRecord(@RequestBody DiseaseRecord record) {
        return ApiResponse.success(diseaseService.createRecord(record));
    }

    @PutMapping("/records/{id}")
    public ApiResponse<DiseaseRecordDTO> updateRecord(@PathVariable Long id, @RequestBody DiseaseRecord record) {
        return ApiResponse.success(diseaseService.updateRecord(id, record));
    }

    @GetMapping("/knowledge")
    @Operation(summary = "获取病虫害知识库")
    public ApiResponse<List<PestKnowledge>> getKnowledge() {
        return ApiResponse.success(diseaseService.getKnowledgeBase());
    }

    @GetMapping("/knowledge/{id}")
    public ApiResponse<PestKnowledge> getKnowledgeById(@PathVariable Long id) {
        return ApiResponse.success(diseaseService.getKnowledgeById(id));
    }

    @GetMapping("/knowledge/search")
    @Operation(summary = "搜索病虫害知识")
    public ApiResponse<List<PestKnowledge>> searchKnowledge(@RequestParam String keyword) {
        return ApiResponse.success(diseaseService.searchKnowledge(keyword));
    }

    @GetMapping("/regulations")
    @Operation(summary = "获取农技规范文档")
    public ApiResponse<List<KnowledgeDocDTO>> getRegulations(@RequestParam(required = false) String category) {
        return ApiResponse.success(diseaseService.getKnowledgeDocs(category));
    }

    @GetMapping("/regulations/{id}")
    @Operation(summary = "获取规范文档详情（规范原文对照）")
    public ApiResponse<KnowledgeDocDTO> getRegulationById(@PathVariable Long id) {
        return ApiResponse.success(diseaseService.getKnowledgeDocById(id));
    }

    @GetMapping("/regulations/search")
    public ApiResponse<List<KnowledgeDocDTO>> searchRegulations(@RequestParam String keyword) {
        return ApiResponse.success(diseaseService.searchKnowledgeDocs(keyword));
    }
}
