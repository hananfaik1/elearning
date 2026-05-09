package com.elearning.backend.service;

import com.elearning.backend.dto.EnrollmentResponse;
import com.elearning.backend.dto.ProgressRequest;
import com.elearning.backend.entity.Course;
import com.elearning.backend.entity.Enrollment;
import com.elearning.backend.entity.User;
import com.elearning.backend.enums.CourseStatus;
import com.elearning.backend.enums.EnrollmentStatus;
import com.elearning.backend.repository.CourseRepository;
import com.elearning.backend.repository.EnrollmentRepository;
import com.elearning.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    // Démarrer un cours
    public EnrollmentResponse start(Long courseId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        if (course.getStatus() != CourseStatus.PUBLISHED) {
            throw new RuntimeException("Ce cours n'est pas publié");
        }

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new RuntimeException("Vous êtes déjà inscrit à ce cours");
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .build();

        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    // Mettre en pause
    public EnrollmentResponse pause(Long enrollmentId, String studentEmail,
                                    ProgressRequest request) {
        Enrollment enrollment = getEnrollmentForStudent(enrollmentId, studentEmail);

        enrollment.setStatus(EnrollmentStatus.PAUSED);
        enrollment.setLastPositionSec(request.getPositionSec());
        enrollment.setProgressPercent(request.getProgressPercent());

        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    // Reprendre
    public EnrollmentResponse resume(Long enrollmentId, String studentEmail) {
        Enrollment enrollment = getEnrollmentForStudent(enrollmentId, studentEmail);

        enrollment.setStatus(EnrollmentStatus.IN_PROGRESS);

        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    // Terminer un cours
    public EnrollmentResponse complete(Long enrollmentId, String studentEmail) {
        Enrollment enrollment = getEnrollmentForStudent(enrollmentId, studentEmail);

        enrollment.setStatus(EnrollmentStatus.COMPLETED);
        enrollment.setProgressPercent(100);
        enrollment.setCompletedAt(LocalDateTime.now());

        return EnrollmentResponse.from(enrollmentRepository.save(enrollment));
    }

    // Mes cours
    public List<EnrollmentResponse> getMyCourses(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        return enrollmentRepository.findByStudent(student)
                .stream()
                .map(EnrollmentResponse::from)
                .toList();
    }

    // Helper privé
    private Enrollment getEnrollmentForStudent(Long enrollmentId, String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable"));

        if (!enrollment.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Accès refusé");
        }

        return enrollment;
    }
}