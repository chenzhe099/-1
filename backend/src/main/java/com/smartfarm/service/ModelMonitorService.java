package com.smartfarm.service;

import com.smartfarm.dto.ModelVersionDTO;
import com.smartfarm.entity.ModelVersion;
import com.smartfarm.repository.ModelVersionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ModelMonitorService {

    private final ModelVersionRepository modelRepo;

    public Map<String, Object> getModelStats() {
        List<ModelVersion> active = modelRepo.findByStatus("active");
        long totalPredictions = active.stream().mapToLong(m -> m.getTotalPredictions() != null ? m.getTotalPredictions() : 0).sum();
        double avgAccuracy = active.stream().filter(m -> m.getAccuracy() != null).mapToDouble(ModelVersion::getAccuracy).average().orElse(0);
        double avgUnknownRate = active.stream().filter(m -> m.getUnknownRate() != null).mapToDouble(ModelVersion::getUnknownRate).average().orElse(0);
        long driftWarnings = active.stream().filter(m -> m.getDriftScore() != null && m.getDriftScore() > 0.2).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("activeCount", active.size());
        stats.put("totalPredictions", totalPredictions);
        stats.put("avgAccuracy", String.format("%.1f%%", avgAccuracy));
        stats.put("avgUnknownRate", String.format("%.1f%%", avgUnknownRate));
        stats.put("driftWarnings", driftWarnings);
        return stats;
    }

    public List<ModelVersionDTO> getAllVersions() {
        return modelRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ModelVersionDTO> getActiveVersions() {
        return modelRepo.findByStatus("active").stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ModelVersionDTO getVersionById(Long id) {
        ModelVersion m = modelRepo.findById(id).orElse(null);
        return m != null ? toDTO(m) : null;
    }

    public ModelVersionDTO createVersion(ModelVersion mv) {
        modelRepo.save(mv);
        return toDTO(mv);
    }

    private ModelVersionDTO toDTO(ModelVersion m) {
        return ModelVersionDTO.builder()
                .id(m.getId()).modelName(m.getModelName()).version(m.getVersion())
                .deployedAt(m.getDeployedAt()).accuracy(m.getAccuracy())
                .driftScore(m.getDriftScore()).status(m.getStatus()).description(m.getDescription()).build();
    }
}
