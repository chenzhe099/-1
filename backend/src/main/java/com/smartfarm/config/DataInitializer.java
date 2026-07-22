package com.smartfarm.config;

import com.smartfarm.entity.*;
import com.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 开发环境数据初始化
 * H2 内存数据库下自动导入演示数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final FarmRepository farmRepo;
    private final FieldRepository fieldRepo;
    private final DeviceRepository deviceRepo;
    private final AlertRepository alertRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) {
            log.info("数据已存在，跳过初始化");
            return;
        }
        log.info("=== 开始初始化演示数据 ===");

        // 用户
        String encodedPwd = passwordEncoder.encode("123456");
        User admin = userRepo.save(User.builder().username("admin").passwordHash(encodedPwd)
                .displayName("系统管理员").role("admin").status("active").phone("13800001001")
                .email("admin@smartfarm.cn").createdAt(LocalDateTime.now()).build());
        userRepo.save(User.builder().username("zhang_tech").passwordHash(encodedPwd)
                .displayName("张技术员").role("technician").status("active").phone("13800001002").build());
        userRepo.save(User.builder().username("li_farmer").passwordHash(encodedPwd)
                .displayName("李农户").role("farmer").status("active").phone("13800001003").build());
        userRepo.save(User.builder().username("yang_coop").passwordHash(encodedPwd)
                .displayName("杨社长").role("manager").status("active").phone("13800001007").build());

        // 农场
        Farm farm1 = farmRepo.save(Farm.builder().name("昆明绿色农业示范基地")
                .address("云南省昆明市呈贡区").managerId(admin.getId()).area(25.5)
                .establishedDate(LocalDate.of(2020, 3, 15)).description("主营蔬菜水果种植").build());

        // 地块
        fieldRepo.save(Field.builder().farmId(farm1.getId()).code("A1").name("番茄种植区")
                .cropName("番茄").area(2.5).status("growing").soilMoisture(62).soilPh(6.5)
                .plantedDate(LocalDate.of(2023, 11, 1)).expectedHarvest(LocalDate.of(2024, 1, 30)).build());
        fieldRepo.save(Field.builder().farmId(farm1.getId()).code("A2").name("黄瓜种植区")
                .cropName("黄瓜").area(2.0).status("growing").soilMoisture(68).soilPh(6.8)
                .plantedDate(LocalDate.of(2023, 11, 10)).expectedHarvest(LocalDate.of(2024, 1, 25)).build());
        fieldRepo.save(Field.builder().farmId(farm1.getId()).code("B1").name("辣椒种植区")
                .cropName("辣椒").area(1.8).status("watering").soilMoisture(45).soilPh(6.3)
                .plantedDate(LocalDate.of(2023, 10, 15)).expectedHarvest(LocalDate.of(2024, 2, 5)).build());
        fieldRepo.save(Field.builder().farmId(farm1.getId()).code("C1").name("草莓种植区")
                .cropName("草莓").area(1.5).status("disease").soilMoisture(55).soilPh(5.8)
                .plantedDate(LocalDate.of(2023, 11, 15)).expectedHarvest(LocalDate.of(2024, 2, 15)).build());

        // 设备
        deviceRepo.save(Device.builder().name("灌溉泵 #1").type("pump").status("online")
                .metrics("{\"flowRate\":12,\"unit\":\"m³/h\"}").runHours(1850)
                .ipAddress("192.168.1.101").firmwareVersion("v2.4.1").build());
        deviceRepo.save(Device.builder().name("环境监测站 #1").type("sensor").status("online")
                .metrics("{\"temperature\":25,\"humidity\":62}").runHours(4100)
                .ipAddress("192.168.1.104").firmwareVersion("v3.0.2").build());
        deviceRepo.save(Device.builder().name("智能温室控制器").type("controller").status("online")
                .metrics("{\"temperature\":25,\"humidity\":70,\"co2\":420}")
                .runHours(2100).ipAddress("192.168.1.106").firmwareVersion("v4.0.0").build());

        // 预警
        alertRepo.save(Alert.builder().title("病虫害预警").message("地块C1草莓检测到白粉病风险").severity("warning")
                .module("disease").isResolved(false).isRead(false).actionRequired("查看详情").build());
        alertRepo.save(Alert.builder().title("设备故障").message("灌溉泵 #3 水压异常").severity("critical")
                .module("devices").isResolved(false).isRead(false).actionRequired("立即维修").build());
        alertRepo.save(Alert.builder().title("天气预警").message("预计周末降温降雨").severity("info")
                .module("weather").isResolved(false).isRead(false).actionRequired("通知防护").build());

        log.info("=== 演示数据初始化完成 ===");
        log.info("默认账户: admin/123456, zhang_tech/123456, li_farmer/123456");
    }
}
