package com.elearning.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "course_files")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CourseFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(nullable = false)
    private String fileName;       // UUID_nom.pdf

    @Column(nullable = false)
    private String originalName;   // nom original

    @Column(nullable = false)
    private String fileType;       // VIDEO ou PDF

    private Long fileSize;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
