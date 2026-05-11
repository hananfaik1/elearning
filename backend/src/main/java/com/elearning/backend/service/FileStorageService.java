package com.elearning.backend.service;

import com.elearning.backend.dto.CourseFileResponse;
import com.elearning.backend.entity.Course;
import com.elearning.backend.entity.CourseFile;
import com.elearning.backend.repository.CourseFileRepository;
import com.elearning.backend.repository.CourseRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private Path rootLocation;

    private final CourseFileRepository fileRepository;
    private final CourseRepository courseRepository;

    @PostConstruct
    public void init() {
        rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(rootLocation);
            System.out.println("✅ Dossier uploads : " + rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le dossier", e);
        }
    }

    // Upload + sauvegarde en base
    public CourseFileResponse uploadFile(MultipartFile file,
                                         Long courseId) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        // Générer nom unique
        String ext = getExtension(file.getOriginalFilename());
        String fileName = UUID.randomUUID() + "_"
                + file.getOriginalFilename()
                .replaceAll("[^a-zA-Z0-9._-]", "_");

        // Sauvegarder sur disque
        Path destination = rootLocation.resolve(fileName).normalize();
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
        }

        // Déterminer le type
        String fileType = isVideo(ext) ? "VIDEO" : "PDF";

        // Sauvegarder en base
        CourseFile courseFile = CourseFile.builder()
                .course(course)
                .fileName(fileName)
                .originalName(file.getOriginalFilename())
                .fileType(fileType)
                .fileSize(file.getSize())
                .build();

        return CourseFileResponse.from(fileRepository.save(courseFile));
    }

    // Récupérer les fichiers d'un cours
    public List<CourseFileResponse> getFilesForCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Cours introuvable"));

        return fileRepository.findByCourseOrderByUploadedAtDesc(course)
                .stream()
                .map(CourseFileResponse::from)
                .toList();
    }

    // Lire le fichier depuis le disque
    public Path loadFile(String fileName) {
        return rootLocation.resolve(fileName).normalize();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private boolean isVideo(String ext) {
        return List.of("mp4","mov","avi","mkv","webm").contains(ext);
    }
}