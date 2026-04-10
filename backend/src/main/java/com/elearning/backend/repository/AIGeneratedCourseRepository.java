package com.elearning.backend.repository;

import com.elearning.backend.entity.AIGeneratedCourse;
import com.elearning.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIGeneratedCourseRepository
        extends JpaRepository<AIGeneratedCourse, Long> {

    List<AIGeneratedCourse> findByProf(User prof);
}
