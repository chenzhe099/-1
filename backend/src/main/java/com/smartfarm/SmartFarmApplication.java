package com.smartfarm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartFarmApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartFarmApplication.class, args);
        System.out.println("========================================");
        System.out.println("  智慧农业管理系统后端启动成功！");
        System.out.println("  Swagger 文档: http://localhost:8080/swagger-ui.html");
        System.out.println("========================================");
    }
}
