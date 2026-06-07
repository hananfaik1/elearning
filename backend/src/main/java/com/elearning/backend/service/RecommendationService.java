package com.elearning.backend.service;

import com.elearning.backend.dto.RecommendationResponse;
import com.elearning.backend.entity.Enrollment;
import com.elearning.backend.repository.EnrollmentRepository;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final VectorStore        vectorStore;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository     userRepository;

    private static final int    TOP_K           = 10;
    private static final double MIN_SCORE       = 0.4;
    private static final int    MAX_RESULTS     = 5;

    // ─────────────────────────────────────────────────────
    // 1. RECOMMANDATIONS AUTOMATIQUES
    //    Basées sur les cours déjà suivis par l'étudiant
    // ─────────────────────────────────────────────────────
    public List<RecommendationResponse> getAutoRecommendations(String userEmail) {

        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(user);

        // Pas encore inscrit → retourner liste vide
        if (enrollments.isEmpty()) {
            log.info("Aucune inscription pour {} → pas de recommandation auto.", userEmail);
            return Collections.emptyList();
        }

        // IDs des cours déjà inscrits (pour les filtrer des résultats)
        Set<String> enrolledIds = enrollments.stream()
                .map(e -> e.getCourse().getId().toString())
                .collect(Collectors.toSet());

        // Construire un texte représentatif des cours suivis
        String queryText = enrollments.stream()
                .map(e -> e.getCourse().getTitle() + " " +
                        (e.getCourse().getDescription() != null ? e.getCourse().getDescription() : "") + " " +
                        e.getCourse().getLevel().name())
                .collect(Collectors.joining(". "));

        log.info("Recherche auto pour {} basée sur {} cours.", userEmail, enrollments.size());

        return searchAndFilter(queryText, enrolledIds);
    }

    // ─────────────────────────────────────────────────────
    // 2. RECHERCHE SÉMANTIQUE
    //    L'étudiant tape une requête libre
    // ─────────────────────────────────────────────────────
    public List<RecommendationResponse> semanticSearch(String query, String userEmail) {

        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Filtrer aussi les cours déjà inscrits dans la recherche
        Set<String> enrolledIds = enrollmentRepository.findByStudent(user).stream()
                .map(e -> e.getCourse().getId().toString())
                .collect(Collectors.toSet());

        log.info("Recherche sémantique : '{}'", query);

        return searchAndFilter(query, enrolledIds);
    }

    // ─────────────────────────────────────────────────────
    // Méthode commune : similarity search + filtrage
    // ─────────────────────────────────────────────────────
    private List<RecommendationResponse> searchAndFilter(String queryText, Set<String> excludeIds) {

        var results = vectorStore.similaritySearch(
                SearchRequest.builder()
                        .query(queryText)
                        .topK(TOP_K)
                        .similarityThreshold(MIN_SCORE)
                        .build()
        );

        return results.stream()
                .filter(doc -> {

                    Object idObj = doc.getMetadata().get("course_id");

                    if (idObj == null) {
                        return false;
                    }

                    String id = idObj.toString();

                    return !excludeIds.contains(id);
                })
                .limit(MAX_RESULTS)
                .map(doc -> {
                    Map<String, Object> meta = doc.getMetadata();
                    return new RecommendationResponse(
                            Long.parseLong(meta.get("course_id").toString()),
                            (String) meta.getOrDefault("title",     ""),
                            (String) meta.getOrDefault("content",   ""),
                            (String) meta.getOrDefault("level",     ""),
                            (String) meta.getOrDefault("prof_name", ""),
                            (String) meta.getOrDefault("category",  ""),
                            doc.getScore() != null ? doc.getScore() : 0.0
                    );
                })
                .toList();
    }
}
