package com.elearning.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_generated_courses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGeneratedCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prof_id")
    private User prof;

    @Column(nullable = false)
    private String topic;

    private String level;

    @Column(columnDefinition = "TEXT")
    private String generatedContent;

    @Builder.Default
    private String status = "PENDING";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
