package com.elearning.backend.dto;

import com.elearning.backend.enums.Level;
import lombok.Data;

@Data
public class CreateCourseRequest {
    private String title;
    private String description;
    private String category;
    private Level level;
    private Integer durationHours;
}
