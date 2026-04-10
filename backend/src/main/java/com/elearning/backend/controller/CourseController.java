package com.elearning.backend.controller;

import com.elearning.backend.dto.CourseResponse;
import com.elearning.backend.dto.CreateCourseRequest;
import com.elearning.backend.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllPublished() {
        return ResponseEntity.ok(courseService.getAllPublished());
    }

    @PostMapping
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<CourseResponse> create(
            @RequestBody CreateCourseRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(courseService.create(request, email));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<List<CourseResponse>> getMyCourses(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(courseService.getMyCourses(email));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<CourseResponse> publish(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(courseService.publish(id, email));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        courseService.delete(id, email);
        return ResponseEntity.noContent().build();
    }
}
