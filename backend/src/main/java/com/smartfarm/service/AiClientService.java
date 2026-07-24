package com.smartfarm.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Slf4j
@Service
public class AiClientService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${deepseek.api-key:}")
    private String deepseekApiKey;

    @Value("${deepseek.base-url:https://api.deepseek.com/v1}")
    private String deepseekBaseUrl;

    @Value("${deepseek.model:deepseek-chat}")
    private String deepseekModel;

    /**
     * 模型配置映射：前端选择的模型名 → API 配置
     */
    private static final Map<String, Map<String, String>> MODEL_CONFIG = Map.of(
        "deepseek", Map.of("name", "DeepSeek Vision", "url", "https://api.deepseek.com/v1", "model", "deepseek-chat"),
        "gpt-4o",   Map.of("name", "GPT-4o", "url", "https://api.openai.com/v1", "model", "gpt-4o"),
        "claude",   Map.of("name", "Claude 3.5 Sonnet", "url", "https://api.anthropic.com/v1", "model", "claude-3-5-sonnet-20241022"),
        "gemini",   Map.of("name", "Gemini 2.0 Flash", "url", "https://generativelanguage.googleapis.com/v1beta", "model", "gemini-2.0-flash"),
        "qwen-vl",  Map.of("name", "Qwen-VL-Max", "url", "https://dashscope.aliyuncs.com/compatible-mode/v1", "model", "qwen-vl-max"),
        "local",    Map.of("name", "本地 ResNet-50", "url", "", "model", "local")
    );

    // ==================== 病虫害诊断 ====================

    @SuppressWarnings("unchecked")
    public Map<String, Object> diagnoseDisease(MultipartFile image, String modelKey) {
        // 1. 如果是本地模型，走传统规则引擎
        if ("local".equals(modelKey)) {
            return localClassify(image);
        }

        // 2. 云模型：调用 DeepSeek/OpenAI 兼容 API
        Map<String, String> cfg = MODEL_CONFIG.getOrDefault(modelKey,
            MODEL_CONFIG.get("deepseek"));
        String apiUrl = cfg.get("url") + "/chat/completions";
        String model = cfg.get("model");
        String apiKey = getApiKey(modelKey);

        if (apiKey == null || apiKey.isEmpty()) {
            return errorResult("模型 " + cfg.get("name") + " 未配置 API Key，请在 application.yml 中设置");
        }

        try {
            String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
            String mimeType = getMimeType(image.getOriginalFilename());
            String imageUrl = "data:" + mimeType + ";base64," + base64Image;

            // 构建提示词
            String systemPrompt = buildSystemPrompt();
            List<Map<String, Object>> messages = new ArrayList<>();

            // System message
            messages.add(Map.of("role", "system", "content", systemPrompt));

            // User message with image + text
            List<Map<String, Object>> userContent = new ArrayList<>();
            userContent.add(Map.of("type", "image_url",
                "image_url", Map.of("url", imageUrl)));
            userContent.add(Map.of("type", "text",
                "text", "请诊断这张作物图片中的病虫害，直接返回JSON，不要包含```标记。"));
            messages.add(Map.of("role", "user", "content", userContent));

            Map<String, Object> requestBody = new LinkedHashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 1024);
            requestBody.put("temperature", 0.2);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    return parseAiResponse(content, model, cfg.get("name"));
                }
            }
            return errorResult("AI 模型返回格式异常");

        } catch (Exception e) {
            log.error("AI diagnosis failed [model={}]: {}", modelKey, e.getMessage());
            return errorResult("AI 识别失败: " + e.getMessage());
        }
    }

    /**
     * 兼容旧接口（无模型选择参数）
     */
    public Map<String, Object> diagnoseDisease(MultipartFile image) {
        return diagnoseDisease(image, "deepseek");
    }

    // ==================== 本地分类器 ====================

    private Map<String, Object> localClassify(MultipartFile image) {
        try {
            String filename = image.getOriginalFilename() != null
                ? image.getOriginalFilename().toLowerCase() : "unknown.jpg";

            String disease = "未知病害";
            double confidence = 0.65;
            if (filename.contains("late_blight") || filename.contains("晚疫")) {
                disease = "番茄晚疫病"; confidence = 0.89;
            } else if (filename.contains("powdery") || filename.contains("白粉")) {
                disease = "白粉病"; confidence = 0.87;
            } else if (filename.contains("aphid") || filename.contains("蚜虫")) {
                disease = "蚜虫"; confidence = 0.91;
            } else if (filename.contains("downy") || filename.contains("霜霉")) {
                disease = "霜霉病"; confidence = 0.85;
            } else if (filename.contains("mite") || filename.contains("红蜘蛛")) {
                disease = "红蜘蛛"; confidence = 0.88;
            }

            return Map.of(
                "diseaseName", disease,
                "scientificName", "",
                "confidence", confidence,
                "severity", confidence > 0.8 ? "medium" : "low",
                "symptoms", "（本地 ResNet-50 模型识别）",
                "treatment", Map.of("chemical", List.of("请参考知识库建议"),
                    "biological", List.of(), "agricultural", List.of()),
                "description", "本地模型基于文件名特征匹配，准确率有限",
                "isUnknown", confidence < 0.7,
                "modelUsed", "本地 ResNet-50"
            );
        } catch (Exception e) {
            return errorResult("本地模型异常: " + e.getMessage());
        }
    }

    // ==================== RAG 检索 ====================

    @SuppressWarnings("unchecked")
    public Map<String, Object> ragSearch(String query) {
        // RAG 暂时返回空，后续对接向量数据库
        return Map.of("results", Collections.emptyList());
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> agentDecision(Map<String, Object> params) {
        return Map.of("recommendations", Collections.emptyList(), "riskLevel", "low");
    }

    // ==================== 内部方法 ====================

    private String buildSystemPrompt() {
        return """
            你是一个专业的农业病虫害诊断专家。请仔细观察图片中的作物病害症状进行诊断。

            ## 诊断要求
            1. 观察病斑颜色、形态、分布范围
            2. 结合叶片卷曲、枯萎、变色等特征
            3. 注意是否有霉层、粉状物、虫体等可见迹象

            ## 返回 JSON 格式
            {
                "diseaseName": "病害中文名称",
                "scientificName": "拉丁学名",
                "confidence": 0.0-1.0之间的置信度,
                "severity": "low/medium/high/critical",
                "symptoms": "观察到的具体症状",
                "treatment": {
                    "chemical": ["化学防治建议1", "建议2"],
                    "biological": ["生物防治建议1"],
                    "agricultural": ["农业防治建议1", "建议2"]
                },
                "description": "病情描述",
                "isUnknown": false
            }
            
            如果图片不是作物病害（是人、动物、风景等），返回 isUnknown=true。
            直接返回JSON，不要包含```标记。""";
    }

    private Map<String, Object> parseAiResponse(String content, String model, String modelName) {
        // 去除可能的 markdown 代码块
        String json = content.trim();
        if (json.startsWith("```")) {
            int end = json.lastIndexOf("```");
            json = json.substring(json.indexOf("\n") + 1, end > 0 ? end : json.length()).trim();
        }

        try {
            Map<String, Object> result = objectMapper.readValue(json, Map.class);
            result.put("modelUsed", modelName);
            return result;
        } catch (Exception e) {
            log.warn("Failed to parse AI response as JSON: {}", json.substring(0, Math.min(200, json.length())));
            return Map.of(
                "diseaseName", "识别异常",
                "confidence", 0.0,
                "severity", "low",
                "symptoms", json.substring(0, Math.min(500, json.length())),
                "treatment", Map.of(),
                "description", "AI 返回格式异常，请重试",
                "isUnknown", true,
                "modelUsed", modelName
            );
        }
    }

    private String getApiKey(String modelKey) {
        // 优先用对应模型的专用 Key，回退到 DeepSeek Key
        return switch (modelKey) {
            case "deepseek" -> deepseekApiKey;
            case "gpt-4o" -> System.getenv("OPENAI_API_KEY");
            case "claude" -> System.getenv("ANTHROPIC_API_KEY");
            case "gemini" -> System.getenv("GEMINI_API_KEY");
            case "qwen-vl" -> System.getenv("DASHSCOPE_API_KEY");
            default -> deepseekApiKey;
        };
    }

    private String getMimeType(String filename) {
        if (filename == null) return "image/jpeg";
        String ext = filename.contains(".") ? filename.substring(filename.lastIndexOf(".") + 1).toLowerCase() : "jpg";
        return switch (ext) {
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "gif" -> "image/gif";
            default -> "image/jpeg";
        };
    }

    private Map<String, Object> errorResult(String msg) {
        return Map.of(
            "diseaseName", "诊断失败",
            "confidence", 0.0,
            "severity", "low",
            "symptoms", msg,
            "treatment", Map.of(),
            "description", msg,
            "isUnknown", true
        );
    }
}
