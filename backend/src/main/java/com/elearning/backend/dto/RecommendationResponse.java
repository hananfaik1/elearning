package com.elearning.backend.dto;

public record RecommendationResponse(
        Long   courseId,
        String title,
        String description,
        String level,
        String profName,
        String category,
        double score
) {}
