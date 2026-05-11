package com.elearning.backend.dto;

import com.elearning.backend.entity.CourseFile;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CourseFileResponse {
    private Long id;
    private String fileName;
    private String originalName;
    private String fileType;
    private Long fileSize;
    private String downloadUrl;
    private LocalDateTime uploadedAt;

    public static CourseFileResponse from(CourseFile f) {
        CourseFileResponse r = new CourseFileResponse();
        r.setId(f.getId());
        r.setFileName(f.getFileName());
        r.setOriginalName(f.getOriginalName());
        r.setFileType(f.getFileType());
        r.setFileSize(f.getFileSize());
        r.setDownloadUrl("/api/files/download/" + f.getFileName());
        r.setUploadedAt(f.getUploadedAt());
        return r;
    }
}