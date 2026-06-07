package com.elearning.backend.service;

import com.elearning.backend.entity.Course;
import com.elearning.backend.enums.CourseStatus;
import com.elearning.backend.repository.CourseRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseIndexingService {

    private final VectorStore vectorStore;
    private final CourseRepository courseRepository;

    @PostConstruct
    public void indexAllPublishedCourses() {

        log.info("🔍 Indexation des cours...");

        List<Course> courses =
                courseRepository.findByStatus(
                        CourseStatus.PUBLISHED
                );

        if (courses.isEmpty()) {
            log.info("Aucun cours publié.");
            return;
        }

        List<Document> docs =
                courses.stream()
                        .map(this::toDocument)
                        .toList();

        vectorStore.add(docs);

        log.info("✅ {} cours indexés", docs.size());
    }

    public void indexCourse(Course course) {

        deleteCourseFromIndex(course.getId());

        vectorStore.add(
                List.of(
                        toDocument(course)
                )
        );

        log.info(
                "Cours '{}' indexé",
                course.getTitle()
        );
    }

    public void deleteCourseFromIndex(Long courseId) {

        vectorStore.delete(
                List.of(
                        courseId.toString()
                )
        );

        log.info(
                "Cours {} supprimé",
                courseId
        );
    }

    private Document toDocument(Course course) {

        String content =
                String.format(
                        """
                        Titre: %s
                        Description: %s
                        Niveau: %s
                        Catégorie: %s
                        """,
                        course.getTitle(),
                        course.getDescription() != null
                                ? course.getDescription()
                                : "",
                        course.getLevel().name(),
                        course.getCategory() != null
                                ? course.getCategory()
                                : ""
                );

        Map<String,Object> metadata =
                Map.of(
                        "course_id",
                        course.getId(),

                        "title",
                        course.getTitle(),

                        "level",
                        course.getLevel().name(),

                        "prof_name",
                        course.getProf().getName(),

                        "category",
                        course.getCategory() != null
                                ? course.getCategory()
                                : ""
                );

        return new Document(
                UUID.randomUUID().toString(),
                content,
                metadata
        );
    }
}