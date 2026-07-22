package com.smartfarm.service;

import com.smartfarm.dto.PriceRecordDTO;
import com.smartfarm.entity.MarketPrice;
import com.smartfarm.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarketPriceService {

    private final MarketPriceRepository priceRepo;

    public Map<String, Object> getMarketStats() {
        List<String> crops = priceRepo.findDistinctCropName();
        List<MarketPrice> todayPrices = priceRepo.findByDate(LocalDate.now());
        if (todayPrices.isEmpty()) todayPrices = priceRepo.findByDate(LocalDate.of(2024, 1, 15));

        MarketPrice maxUp = null, maxDown = null;
        double avgPrice = 0;
        for (MarketPrice p : todayPrices) {
            avgPrice += p.getPricePerKg();
            if (maxUp == null || p.getChangePercent() > maxUp.getChangePercent()) maxUp = p;
            if (maxDown == null || p.getChangePercent() < maxDown.getChangePercent()) maxDown = p;
        }
        if (!todayPrices.isEmpty()) avgPrice /= todayPrices.size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("cropCount", crops.size());
        stats.put("avgPrice", String.format("%.2f元/kg", avgPrice));
        stats.put("maxUpCrop", maxUp != null ? maxUp.getCropName() + " +" + maxUp.getChangePercent() + "%" : "--");
        stats.put("maxDownCrop", maxDown != null ? maxDown.getCropName() + " " + maxDown.getChangePercent() + "%" : "--");
        return stats;
    }

    public Map<String, List<PriceRecordDTO>> getPriceTrend(String cropName) {
        LocalDate end = LocalDate.of(2024, 1, 15);
        LocalDate start = end.minusDays(7);

        List<MarketPrice> prices;
        if (cropName != null && !cropName.equals("all")) {
            prices = priceRepo.findByCropNameAndDateBetweenOrderByDateAsc(cropName, start, end);
        } else {
            prices = new ArrayList<>();
            for (String crop : priceRepo.findDistinctCropName()) {
                prices.addAll(priceRepo.findByCropNameAndDateBetweenOrderByDateAsc(crop, start, end));
            }
        }

        Map<String, List<PriceRecordDTO>> result = new LinkedHashMap<>();
        for (MarketPrice p : prices) {
            result.computeIfAbsent(p.getCropName(), k -> new ArrayList<>())
                    .add(toDTO(p));
        }
        return result;
    }

    public List<PriceRecordDTO> getTodayPrices() {
        List<MarketPrice> prices = priceRepo.findByDate(LocalDate.now());
        if (prices.isEmpty()) prices = priceRepo.findByDate(LocalDate.of(2024, 1, 15));
        return prices.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private PriceRecordDTO toDTO(MarketPrice p) {
        return PriceRecordDTO.builder()
                .cropName(p.getCropName()).pricePerKg(p.getPricePerKg())
                .unit(p.getUnit()).market(p.getMarket()).date(p.getDate())
                .changePercent(p.getChangePercent()).trend(p.getTrend()).build();
    }
}
