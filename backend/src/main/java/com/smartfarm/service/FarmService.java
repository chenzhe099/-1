package com.smartfarm.service;

import com.smartfarm.dto.FieldDTO;
import com.smartfarm.dto.FarmDTO;
import com.smartfarm.dto.PlantingCycleDTO;
import com.smartfarm.entity.Farm;
import com.smartfarm.entity.Field;
import com.smartfarm.entity.PlantingCycle;
import com.smartfarm.exception.ResourceNotFoundException;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmService {

    private final FarmRepository farmRepo;
    private final FieldRepository fieldRepo;
    private final PlantingCycleRepository cycleRepo;

    // ============ 农场 ============

    public List<FarmDTO> getAllFarms() {
        return farmRepo.findAll().stream().map(this::toFarmDTO).collect(Collectors.toList());
    }

    public FarmDTO getFarmById(Long id) {
        Farm f = farmRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("农场", id));
        return toFarmDTO(f);
    }

    public FarmDTO createFarm(Farm farm) {
        farmRepo.save(farm);
        return toFarmDTO(farm);
    }

    public FarmDTO updateFarm(Long id, Farm updated) {
        Farm f = farmRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("农场", id));
        if (updated.getName() != null) f.setName(updated.getName());
        if (updated.getAddress() != null) f.setAddress(updated.getAddress());
        if (updated.getArea() != null) f.setArea(updated.getArea());
        if (updated.getDescription() != null) f.setDescription(updated.getDescription());
        farmRepo.save(f);
        return toFarmDTO(f);
    }

    public void deleteFarm(Long id) {
        farmRepo.deleteById(id);
    }

    // ============ 地块 ============

    public List<FieldDTO> getFieldsByFarm(Long farmId) {
        return fieldRepo.findByFarmId(farmId).stream().map(this::toFieldDTO).collect(Collectors.toList());
    }

    public List<FieldDTO> getAllFields() {
        return fieldRepo.findAll().stream().map(this::toFieldDTO).collect(Collectors.toList());
    }

    public FieldDTO getFieldById(Long id) {
        Field f = fieldRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("地块", id));
        return toFieldDTO(f);
    }

    public FieldDTO createField(Field field) {
        fieldRepo.save(field);
        return toFieldDTO(field);
    }

    public FieldDTO updateField(Long id, Field updated) {
        Field f = fieldRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("地块", id));
        if (updated.getCropName() != null) f.setCropName(updated.getCropName());
        if (updated.getStatus() != null) f.setStatus(updated.getStatus());
        if (updated.getSoilMoisture() != null) f.setSoilMoisture(updated.getSoilMoisture());
        if (updated.getArea() != null) f.setArea(updated.getArea());
        fieldRepo.save(f);
        return toFieldDTO(f);
    }

    public void deleteField(Long id) {
        fieldRepo.deleteById(id);
    }

    // ============ 种植周期 ============

    public List<PlantingCycleDTO> getCyclesByFarm(Long farmId) {
        return cycleRepo.findByFarmId(farmId).stream().map(this::toCycleDTO).collect(Collectors.toList());
    }

    public List<PlantingCycleDTO> getActiveCycles() {
        return cycleRepo.findByActualHarvestDateIsNull().stream()
                .map(this::toCycleDTO).collect(Collectors.toList());
    }

    public PlantingCycleDTO createCycle(PlantingCycle cycle) {
        cycleRepo.save(cycle);
        return toCycleDTO(cycle);
    }

    // ============ DTO 映射 ============

    private FarmDTO toFarmDTO(Farm f) {
        int fieldCount = fieldRepo.findByFarmId(f.getId()).size();
        return FarmDTO.builder()
                .id(f.getId()).name(f.getName()).address(f.getAddress())
                .managerId(f.getManagerId()).area(f.getArea())
                .establishedDate(f.getEstablishedDate())
                .description(f.getDescription()).fieldCount(fieldCount).build();
    }

    private FieldDTO toFieldDTO(Field f) {
        return FieldDTO.builder()
                .id(f.getId()).farmId(f.getFarmId()).code(f.getCode())
                .name(f.getName()).cropId(f.getCropId()).cropName(f.getCropName())
                .area(f.getArea()).status(f.getStatus())
                .soilMoisture(f.getSoilMoisture()).soilPh(f.getSoilPh())
                .plantedDate(f.getPlantedDate()).expectedHarvest(f.getExpectedHarvest()).build();
    }

    private PlantingCycleDTO toCycleDTO(PlantingCycle c) {
        return PlantingCycleDTO.builder()
                .id(c.getId()).fieldId(c.getFieldId()).cropId(c.getCropId())
                .cropName(c.getCropName()).plantedDate(c.getPlantedDate())
                .expectedHarvestDate(c.getExpectedHarvestDate())
                .actualHarvestDate(c.getActualHarvestDate())
                .yieldTons(c.getYieldTons()).growthStage(c.getGrowthStage())
                .notes(c.getNotes()).build();
    }
}
