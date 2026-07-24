package com.smartfarm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

/**
 * AI 服务配置 — 提供 RestTemplate 等 Bean
 */
@Configuration
public class AiConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30_000);    // 连接超时 30s
        factory.setReadTimeout(120_000);      // 读取超时 120s（AI 推理可能较慢）
        return new RestTemplate(factory);
    }
}
