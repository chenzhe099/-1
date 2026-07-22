package com.smartfarm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmDTO {

    private Long id;
    private String name;
    private String address;
    private Long managerId;
    private String area;
    private String establishedDate;
    private String description;
    private int fieldCount;
}
