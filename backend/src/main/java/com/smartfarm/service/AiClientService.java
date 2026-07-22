package com.smartfarm.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Slf4j
@Service
public class AiClientService {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;

    public AiClientService(@Value("${ai-service.url}") String aiServiceUrl) {
        this.restTemplate = new RestTemplate();
        this.aiServiceUrl = aiServiceUrl;
    }

    /**
     * 调用 AI 服务进行病虫害图片识别
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> diagnoseDisease(MultipartFile image) {
        try {
            String url = aiServiceUrl + "/api/v1/diagnosis";
            ByteArrayResource resource = new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename();
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("AI diagnosis failed: {}", e.getMessage());
            return Map.of(
                "diseaseName", "未知病害",
                "confidence", 0.0,
                "isUnknown", true,
                "error", e.getMessage()
            );
        }
    }

    /**
     * RAG 检索农技规范
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> ragSearch(String query) {
        try {
            String url = aiServiceUrl + "/api/v1/rag/search";
            Map<String, String> request = Map.of("query", query);
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("RAG search failed: {}", e.getMessage());
            return Map.of("results", java.util.Collections.emptyList());
        }
    }

    /**
     * Agent 综合决策
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> agentDecision(Map<String, Object> params) {
        try {
            String url = aiServiceUrl + "/api/v1/agent/decision";
            ResponseEntity<Map> response = restTemplate.postForEntity(url, params, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Agent decision failed: {}", e.getMessage());
            return Map.of(
                "recommendations", java.util.Collections.emptyList(),
                "riskLevel", "unknown"
            );
        }
    }
}
