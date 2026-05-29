package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;
import java.util.List;

/**
 * Response DTO returned after AI auto-grading a test submission.
 */
@Data
public class AiTestResultDto {
    private Long assignmentId;
    private String employeeName;
    private String technology;
    private String category;
    private Double score;           // 0-100
    private int correctAnswers;
    private int totalQuestions;
    private String aiFeedback;
    private boolean skillVerified;  // true if score >= threshold (e.g. 70%)
    private String status;
    private List<QuestionResultDto> questionResults;

    @Data
    public static class QuestionResultDto {
        private Long questionId;
        private String questionText;
        private String selectedAnswer;
        private String correctAnswer;
        private boolean correct;
        private String explanation;
    }
}
