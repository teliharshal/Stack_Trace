package com.LearnTrack.skilltrack_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * A single MCQ question belonging to an AiTest.
 */
@Entity
@Table(name = "ai_test_questions")
public class AiTestQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ai_test_id")
    @JsonIgnore
    private AiTest aiTest;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    // Options stored as comma-separated: "A. option1||B. option2||C. option3||D. option4"
    @Column(columnDefinition = "TEXT")
    private String options;

    // Correct answer key: "A", "B", "C", or "D"
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    // ===== GETTERS =====
    public Long getId() { return id; }
    public AiTest getAiTest() { return aiTest; }
    public String getQuestionText() { return questionText; }
    public String getOptions() { return options; }
    public String getCorrectAnswer() { return correctAnswer; }
    public String getExplanation() { return explanation; }

    // ===== SETTERS =====
    public void setId(Long id) { this.id = id; }
    public void setAiTest(AiTest aiTest) { this.aiTest = aiTest; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }
    public void setOptions(String options) { this.options = options; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
