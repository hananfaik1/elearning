package com.elearning.backend.controller;

import com.elearning.backend.dto.EnrollmentResponse;
import com.elearning.backend.dto.ProgressRequest;
import com.elearning.backend.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/{courseId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> start(
            @PathVariable Long courseId,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(enrollmentService.start(courseId, email));
    }

    @PutMapping("/{enrollmentId}/pause")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> pause(
            @PathVariable Long enrollmentId,
            @AuthenticationPrincipal String email,
            @RequestBody ProgressRequest request) {
        return ResponseEntity.ok(enrollmentService.pause(enrollmentId, email, request));
    }

    @PutMapping("/{enrollmentId}/resume")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> resume(
            @PathVariable Long enrollmentId,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(enrollmentService.resume(enrollmentId, email));
    }

    @PutMapping("/{enrollmentId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<EnrollmentResponse> complete(
            @PathVariable Long enrollmentId,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(enrollmentService.complete(enrollmentId, email));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<EnrollmentResponse>> getMyCourses(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(enrollmentService.getMyCourses(email));
    }
}