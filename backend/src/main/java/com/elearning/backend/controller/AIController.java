package com.elearning.backend.controller;

import com.elearning.backend.dto.AIGeneratedCourseResponse;
import com.elearning.backend.dto.GenerateCourseRequest;
import com.elearning.backend.service.CourseGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final CourseGeneratorService generatorService;

    @PostMapping("/generate-course")
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<AIGeneratedCourseResponse> generate(
            @RequestBody GenerateCourseRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(generatorService.generateCourse(request, email));
    }

    @GetMapping("/my-generations")
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<List<AIGeneratedCourseResponse>> myGenerations(
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(generatorService.getMyGenerations(email));
    }
}
