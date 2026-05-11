package com.elearning.backend.repository;

import com.elearning.backend.entity.CourseFile;
import com.elearning.backend.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseFileRepository
        extends JpaRepository<CourseFile, Long> {

    List<CourseFile> findByCourseOrderByUploadedAtDesc(Course course);
}