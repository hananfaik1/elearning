package com.elearning.backend.repository;

import com.elearning.backend.entity.Course;
import com.elearning.backend.entity.User;
import com.elearning.backend.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByStatus(CourseStatus status);

    List<Course> findByProf(User prof);

    Optional<Course> findByIdAndProf(Long id, User prof);

    List<Course> findByCategory(String category);
}
