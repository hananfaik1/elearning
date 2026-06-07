package com.elearning.backend.controller;

import com.elearning.backend.dto.RecommendationResponse;
import com.elearning.backend.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/auto")
    public ResponseEntity<List<RecommendationResponse>> getAutoRecommendations(
            Principal principal) {

        // ✅ Garde-fou explicite
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                recommendationService.getAutoRecommendations(principal.getName())
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<RecommendationResponse>> semanticSearch(
            @RequestParam String query,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                recommendationService.semanticSearch(query, principal.getName())
        );
    }
}