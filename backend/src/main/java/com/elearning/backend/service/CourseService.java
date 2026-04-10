package com.elearning.backend.service;

import com.elearning.backend.dto.CourseResponse;
import com.elearning.backend.dto.CreateCourseRequest;
import com.elearning.backend.entity.Course;
import com.elearning.backend.entity.User;
import com.elearning.backend.enums.CourseStatus;
import com.elearning.backend.repository.CourseRepository;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    // Créer un cours (PROF seulement)
    public CourseResponse create(CreateCourseRequest request, String profEmail) {
        User prof = userRepository.findByEmail(profEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .level(request.getLevel())
                .durationHours(request.getDurationHours())
                .prof(prof)
                .build();

        return CourseResponse.from(courseRepository.save(course));
    }

    // Voir tous les cours publiés
    public List<CourseResponse> getAllPublished() {
        return courseRepository.findByStatus(CourseStatus.PUBLISHED)
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    // Voir les cours du prof connecté
    public List<CourseResponse> getMyCourses(String profEmail) {
        User prof = userRepository.findByEmail(profEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return courseRepository.findByProf(prof)
                .stream()
                .map(CourseResponse::from)
                .toList();
    }

    // Publier un cours
    public CourseResponse publish(Long courseId, String profEmail) {
        User prof = userRepository.findByEmail(profEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findByIdAndProf(courseId, prof)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        course.setStatus(CourseStatus.PUBLISHED);
        return CourseResponse.from(courseRepository.save(course));
    }

    // Supprimer un cours
    public void delete(Long courseId, String profEmail) {
        User prof = userRepository.findByEmail(profEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findByIdAndProf(courseId, prof)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        courseRepository.delete(course);
    }
}
