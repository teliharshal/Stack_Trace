package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;

/**
 * Request body for admin to generate an AI test.
 */
@Data
public class GenerateTestRequest {
    private String technology;    // e.g. "Java", "React", "Spring Boot"
    private String category;      // e.g. "Backend", "Frontend", "DevOps"
    private String difficulty;    // EASY | MEDIUM | HARD
    private int questionCount;    // 5, 10, 15, 20
    private Long skillId;         // optional: link to a skill in catalog
}
