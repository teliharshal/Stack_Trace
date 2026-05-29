package com.LearnTrack.skilltrack_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents an AI-generated test for a specific skill and category.
 * Admin generates this test; it can then be assigned to employees.
 */
@Entity
@Table(name = "ai_tests")
public class AiTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String technology;   // e.g. "Java", "React"
    private String category;     // e.g. "Backend", "Frontend"
    private String difficulty;   // EASY, MEDIUM, HARD
    private int questionCount;

    private LocalDateTime generatedAt;

    // The skill this test is linked to (optional — admin can link after generation)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private SkillEntity skill;

    @OneToMany(mappedBy = "aiTest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AiTestQuestion> questions = new ArrayList<>();

    // ===== GETTERS =====
    public Long getId() { return id; }
    public String getTechnology() { return technology; }
    public String getCategory() { return category; }
    public String getDifficulty() { return difficulty; }
    public int getQuestionCount() { return questionCount; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public SkillEntity getSkill() { return skill; }
    public List<AiTestQuestion> getQuestions() { return questions; }

    // ===== SETTERS =====
    public void setId(Long id) { this.id = id; }
    public void setTechnology(String technology) { this.technology = technology; }
    public void setCategory(String category) { this.category = category; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
    public void setSkill(SkillEntity skill) { this.skill = skill; }
    public void setQuestions(List<AiTestQuestion> questions) { this.questions = questions; }
}
