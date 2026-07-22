package com.smartfarm.service;

import com.smartfarm.dto.WeatherDTO;
import com.smartfarm.entity.WeatherRecord;
import com.smartfarm.repository.WeatherRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final WeatherRecordRepository weatherRepo;

    public Map<String, Object> getWeatherStats() {
        WeatherRecord today = weatherRepo.findTop1ByOrderByDateDesc().orElse(null);
        Map<String, Object> stats = new HashMap<>();
        if (today != null) {
            stats.put("todayTemp", today.getTemperatureHigh() + "° / " + today.getTemperatureLow() + "°");
            stats.put("todayRainfall", today.getRainfallMm() + "mm");
            stats.put("todayHumidity", today.getHumidity() + "%");
            stats.put("todayWind", today.getWindSpeed() + "m/s");
            stats.put("condition", today.getCondition());
        }
        return stats;
    }

    public List<WeatherDTO> getWeatherTrend() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(14);
        return weatherRepo.findByDateBetweenOrderByDateAsc(start, end)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<WeatherDTO> getWeatherForecast() {
        return weatherRepo.findByDateBetweenOrderByDateAsc(
                LocalDate.now(), LocalDate.now().plusDays(7)
        ).stream().map(this::toDTO).collect(Collectors.toList());
    }

    public WeatherDTO addWeatherRecord(WeatherRecord record) {
        weatherRepo.save(record);
        return toDTO(record);
    }

    private WeatherDTO toDTO(WeatherRecord w) {
        return WeatherDTO.builder()
                .date(w.getDate()).temperatureHigh(w.getTemperatureHigh())
                .temperatureLow(w.getTemperatureLow()).humidity(w.getHumidity())
                .rainfallMm(w.getRainfallMm()).windSpeed(w.getWindSpeed())
                .condition(w.getCondition()).forecast(w.getForecast()).build();
    }
}
