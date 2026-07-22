package com.smartfarm.exception;

/**
 * 资源未找到异常
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resource, Long id) {
        super(resource + " 不存在 (id=" + id + ")");
    }

    public ResourceNotFoundException(String resource, String key) {
        super(resource + " 不存在 (key=" + key + ")");
    }
}
