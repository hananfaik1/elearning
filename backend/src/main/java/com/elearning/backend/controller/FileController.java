package com.elearning.backend.controller;

import com.elearning.backend.dto.CourseFileResponse;
import com.elearning.backend.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService service;

    // Upload un fichier pour un cours
   /* @PostMapping(value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<CourseFileResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId) {
        try {
            CourseFileResponse response = service.uploadFile(file, courseId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }*/


    @PostMapping(value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("courseId") Long courseId,
            @AuthenticationPrincipal String email,
            Authentication authentication) {

        // Log pour debug
        System.out.println("=== UPLOAD ===");
        System.out.println("Email: " + email);
        System.out.println("Authorities: " + authentication.getAuthorities());

        // Vérification manuelle du rôle
        boolean isProf = authentication.getAuthorities()
                .stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_PROF"));

        if (!isProf) {
            return ResponseEntity.status(403)
                    .body(Map.of("error", "Accès réservé aux professeurs"));
        }

        try {
            CourseFileResponse response = service.uploadFile(file, courseId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Récupérer les fichiers d'un cours
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CourseFileResponse>> getFiles(
            @PathVariable Long courseId) {
        return ResponseEntity.ok(service.getFilesForCourse(courseId));
    }

    // Télécharger / streamer un fichier
    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> download(
            @PathVariable String fileName) {
        try {
            Path path = service.loadFile(fileName);
            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            // Détecter le content type
            String contentType = fileName.matches(".*\\.(mp4|mov|avi|webm)$")
                    ? "video/mp4"
                    : "application/octet-stream";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + fileName + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}