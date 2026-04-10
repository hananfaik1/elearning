package com.elearning.backend.dto;

import com.elearning.backend.entity.Enrollment;
import com.elearning.backend.enums.EnrollmentStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EnrollmentResponse {
    private Long id;
    private String courseTitle;
    private String category;
    private EnrollmentStatus status;
    private Integer progressPercent;
    private Integer lastPositionSec;
    private LocalDateTime startedAt;

    public static EnrollmentResponse from(Enrollment e) {
        EnrollmentResponse r = new EnrollmentResponse();
        r.setId(e.getId());
        r.setCourseTitle(e.getCourse().getTitle());
        r.setCategory(e.getCourse().getCategory());
        r.setStatus(e.getStatus());
        r.setProgressPercent(e.getProgressPercent());
        r.setLastPositionSec(e.getLastPositionSec());
        r.setStartedAt(e.getStartedAt());
        return r;
    }
}
