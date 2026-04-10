package com.elearning.backend.dto;

import com.elearning.backend.entity.AIGeneratedCourse;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AIGeneratedCourseResponse {
    private Long id;
    private String topic;
    private String level;
    private String generatedContent;
    private String status;
    private LocalDateTime createdAt;

    public static AIGeneratedCourseResponse from(AIGeneratedCourse ai) {
        AIGeneratedCourseResponse r = new AIGeneratedCourseResponse();
        r.setId(ai.getId());
        r.setTopic(ai.getTopic());
        r.setLevel(ai.getLevel());
        r.setGeneratedContent(ai.getGeneratedContent());
        r.setStatus(ai.getStatus());
        r.setCreatedAt(ai.getCreatedAt());
        return r;
    }
}
