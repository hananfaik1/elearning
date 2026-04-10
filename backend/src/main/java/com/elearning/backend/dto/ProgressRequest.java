package com.elearning.backend.dto;

import lombok.Data;

@Data
public class ProgressRequest {
    private Integer positionSec;
    private Integer progressPercent;
}
