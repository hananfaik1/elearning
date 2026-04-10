package com.elearning.backend.service;

import com.elearning.backend.dto.AIGeneratedCourseResponse;
import com.elearning.backend.dto.GenerateCourseRequest;
import com.elearning.backend.entity.AIGeneratedCourse;
import com.elearning.backend.entity.User;
import com.elearning.backend.repository.AIGeneratedCourseRepository;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseGeneratorService {

    private final ChatClient.Builder chatClientBuilder;
    private final AIGeneratedCourseRepository aiRepository;
    private final UserRepository userRepository;

    public AIGeneratedCourseResponse generateCourse(
            GenerateCourseRequest request, String profEmail) {

        User prof = userRepository.findByEmail(profEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Construire le prompt
        String prompt = buildPrompt(request);

        // Appel au LLM via Spring AI
        String generatedContent = chatClientBuilder.build()
                .prompt()
                .user(prompt)
                .call()
                .content();

        // Sauvegarder en base
        AIGeneratedCourse aiCourse = AIGeneratedCourse.builder()
                .prof(prof)
                .topic(request.getTopic())
                .level(request.getLevel())
                .generatedContent(generatedContent)
                .status("DONE")
                .build();

        return AIGeneratedCourseResponse.from(aiRepository.save(aiCourse));
    }

    public List<AIGeneratedCourseResponse> getMyGenerations(String profEmail) {
        User prof = userRepository.findByEmail(profEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return aiRepository.findByProf(prof)
                .stream()
                .map(AIGeneratedCourseResponse::from)
                .toList();
    }

    private String buildPrompt(GenerateCourseRequest request) {
        return String.format("""
            Tu es un expert en création de cours e-learning.
            Génère un cours structuré complet en JSON avec ce format exact :
            {
              "title": "...",
              "description": "...",
              "objectives": ["obj1", "obj2", "obj3"],
              "modules": [
                {
                  "title": "Module 1 : ...",
                  "lessons": [
                    {"title": "Leçon 1", "duration": "15 min", "description": "..."},
                    {"title": "Leçon 2", "duration": "20 min", "description": "..."}
                  ]
                }
              ],
              "quiz": [
                {
                  "question": "...",
                  "choices": ["A", "B", "C", "D"],
                  "answer": "A"
                }
              ]
            }
            
            Sujet : %s
            Niveau : %s
            Durée totale : %d heures
            Langue : %s
            
            Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.
            """,
                request.getTopic(),
                request.getLevel(),
                request.getDurationHours(),
                request.getLanguage() != null ? request.getLanguage() : "Français"
        );
    }
}
