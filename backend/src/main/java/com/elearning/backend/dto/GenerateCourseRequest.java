package com.elearning.backend.dto;

import lombok.Data;

@Data
public class GenerateCourseRequest {
    private String topic;
    private String level;
    private Integer durationHours;
    private String language;
}
