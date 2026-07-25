package com.smartfarm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.net.InetSocketAddress;
import java.net.Proxy;

/**
 * AI 服务配置 — 提供 RestTemplate 等 Bean
 */
@Configuration
public class AiConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30_000);
        factory.setReadTimeout(120_000);

        // 代理配置（访问外网 AI API）
        String proxyHost = System.getenv().getOrDefault("PROXY_HOST", "127.0.0.1");
        int proxyPort = Integer.parseInt(System.getenv().getOrDefault("PROXY_PORT", "7892"));
        if (proxyPort > 0) {
            factory.setProxy(new Proxy(Proxy.Type.HTTP,
                    new InetSocketAddress(proxyHost, proxyPort)));
        }

        return new RestTemplate(factory);
    }
}
