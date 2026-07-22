package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {

    private int code = 200;
    private String message = "success";
    private T data;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message("success")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String msg, T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .message(msg)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String msg) {
        return ApiResponse.<T>builder()
                .code(code)
                .message(msg)
                .build();
    }
}
