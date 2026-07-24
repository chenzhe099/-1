package com.smartfarm.controller;

import com.smartfarm.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
public class FileUploadController {

    @Value("${minio.bucket:smartfarm-images}")
    private String bucket;

    private final Path uploadDir = Paths.get(System.getProperty("java.io.tmpdir"), "smartfarm-uploads");

    @PostMapping("/upload")
    public ApiResponse<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
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

            return ApiResponse.ok(result);
        } catch (IOException e) {
            log.error("File upload failed", e);
            return ApiResponse.fail(500, "文件上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/{filename}")
    public ApiResponse<Map<String, String>> getFile(@PathVariable String filename) {
        return ApiResponse.ok(Map.of("filename", filename, "status", "available"));
    }
}
