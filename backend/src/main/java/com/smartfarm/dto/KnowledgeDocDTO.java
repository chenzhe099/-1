package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeDocDTO {

    private Long id;
    private String title;
    private String category;
    private String cropTarget;
    private String originalText;
    private String sourceRegulation;
    private String keywords;
    private String publishDate;
}
