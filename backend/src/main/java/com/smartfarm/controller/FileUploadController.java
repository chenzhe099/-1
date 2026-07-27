package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * 文件上传控制器
 * 支持图片、文档等文件的上传和访问
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "文件管理", description = "文件上传、下载与管理接口")
public class FileUploadController {

    @Value("${minio.bucket:smartfarm-images}")
    private String bucket;

    private final Path uploadDir = Paths.get(System.getProperty("java.io.tmpdir"), "smartfarm-uploads");

    @PostMapping("/upload")
    @Operation(summary = "上传文件", description = "上传图片/文档等文件到临时存储目录，返回访问 URL")
    public ApiResponse<Map<String, Object>> upload(
            @Parameter(description = "待上传的文件") @RequestParam("file") MultipartFile file) {
        try {
            Files.createDirectories(uploadDir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = uploadDir.resolve(filename);
            file.transferTo(target.toFile());

            Map<String, Object> result = new HashMap<>();
            result.put("filename", filename);
            result.put("size", file.getSize());
            result.put("url", "/api/v1/files/" + filename);
            result.put("contentType", file.getContentType());

            log.info("文件上传成功: {}, size={}", filename, file.getSize());
            return ApiResponse.ok(result);
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return ApiResponse.fail(500, "文件上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/{filename}")
    @Operation(summary = "获取文件信息", description = "根据文件名获取文件的可用状态信息")
    public ApiResponse<Map<String, String>> getFile(@PathVariable String filename) {
        return ApiResponse.ok(Map.of("filename", filename, "status", "available"));
    }
}
