package com.elearning.backend.dto;

import com.elearning.backend.entity.Course;
import com.elearning.backend.enums.CourseStatus;
import com.elearning.backend.enums.Level;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private Level level;
    private CourseStatus status;
    private Integer durationHours;
    private String profName;
    private LocalDateTime createdAt;

    public static CourseResponse from(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setTitle(course.getTitle());
        response.setDescription(course.getDescription());
        response.setCategory(course.getCategory());
        response.setLevel(course.getLevel());
        response.setStatus(course.getStatus());
        response.setDurationHours(course.getDurationHours());
        response.setProfName(course.getProf().getName());
        response.setCreatedAt(course.getCreatedAt());
        return response;
    }
}
