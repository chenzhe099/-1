package com.smartfarm.service;

import com.smartfarm.dto.DiseaseRecordDTO;
import com.smartfarm.dto.KnowledgeDocDTO;
import com.smartfarm.entity.*;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiseaseService {

    private final DiseaseRecordRepository diseaseRepo;
    private final PestKnowledgeRepository pestRepo;
    private final KnowledgeDocumentRepository knowledgeDocRepo;

    // ============ 病虫害记录 ============

    public List<DiseaseRecordDTO> getAllRecords() {
        return diseaseRepo.findAll().stream().map(this::toRecordDTO).collect(Collectors.toList());
    }

    public DiseaseRecordDTO getRecordById(Long id) {
        DiseaseRecord r = diseaseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("病虫害记录", id));
        return toRecordDTO(r);
    }

    public DiseaseRecordDTO createRecord(DiseaseRecord record) {
        if (record.getStatus() == null) record.setStatus("processing");
        diseaseRepo.save(record);
        return toRecordDTO(record);
    }

    public DiseaseRecordDTO updateRecord(Long id, DiseaseRecord updated) {
        DiseaseRecord r = diseaseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("病虫害记录", id));
        if (updated.getStatus() != null) r.setStatus(updated.getStatus());
        if (updated.getTreatmentPlan() != null) r.setTreatmentPlan(updated.getTreatmentPlan());
        if ("resolved".equals(updated.getStatus())) {
            r.setResolvedAt(java.time.LocalDateTime.now());
        }
        diseaseRepo.save(r);
        return toRecordDTO(r);
    }

    // ============ 病虫害知识库 ============

    public List<PestKnowledge> getKnowledgeBase() {
        return pestRepo.findAll();
    }

    public List<PestKnowledge> searchKnowledge(String keyword) {
        return pestRepo.findByNameContaining(keyword);
    }

    public PestKnowledge getKnowledgeById(Long id) {
        return pestRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("病虫害知识", id));
    }

    // ============ 规范知识文档 ============

    public List<KnowledgeDocDTO> getKnowledgeDocs(String category) {
        List<KnowledgeDocument> docs;
        if (category != null) {
            docs = knowledgeDocRepo.findByCategory(category);
        } else {
            docs = knowledgeDocRepo.findAll();
        }
        return docs.stream().map(this::toDocDTO).collect(Collectors.toList());
    }

    public KnowledgeDocDTO getKnowledgeDocById(Long id) {
        KnowledgeDocument d = knowledgeDocRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("知识文档", id));
        return toDocDTO(d);
    }

    public List<KnowledgeDocDTO> searchKnowledgeDocs(String keyword) {
        return knowledgeDocRepo.findByTitleContainingOrOriginalTextContaining(keyword, keyword)
                .stream().map(this::toDocDTO).collect(Collectors.toList());
    }

    // ============ 映射 ============

    private DiseaseRecordDTO toRecordDTO(DiseaseRecord r) {
        return DiseaseRecordDTO.builder()
                .id(r.getId()).fieldId(r.getFieldId()).fieldCode(r.getFieldCode())
                .diseaseName(r.getDiseaseName()).cropAffected(r.getCropAffected())
                .detectedAt(r.getDetectedAt()).severity(r.getSeverity())
                .status(r.getStatus()).imageUrl(r.getImageUrl())
                .treatmentPlan(r.getTreatmentPlan()).build();
    }

    private KnowledgeDocDTO toDocDTO(KnowledgeDocument d) {
        return KnowledgeDocDTO.builder()
                .id(d.getId()).title(d.getTitle()).category(d.getCategory())
                .cropTarget(d.getCropTarget()).originalText(d.getOriginalText())
                .sourceRegulation(d.getSourceRegulation()).keywords(d.getKeywords())
                .publishDate(d.getPublishDate()).build();
    }
}
