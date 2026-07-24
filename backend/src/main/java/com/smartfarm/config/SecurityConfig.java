package com.smartfarm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain configure(HttpSecurity http) throws Exception {
        http
            // 启用 CORS（用 CorsConfig 里的 allowedOriginPatterns("*")）
            .cors(cors -> {})
            // 禁用 CSRF（前后端分离 + CORS 场景下没必要）
            .csrf(csrf -> csrf.disable())
            // 关键：先把 OPTIONS 全部放行，CORS 预检才能过
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // 开发阶段全部开放，生产再改成 .authenticated()
                .anyRequest().permitAll()
            )
            // 关掉表单登录（API 用 JWT）
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
