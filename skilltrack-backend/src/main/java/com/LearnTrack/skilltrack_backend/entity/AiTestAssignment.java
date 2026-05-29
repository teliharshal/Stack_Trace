package com.LearnTrack.skilltrack_backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Links an AiTest to a specific employee (assignment).
 * Tracks submission status and AI-graded result.
 */
@Entity
@Table(name = "ai_test_assignments")
public class AiTestAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonBackReference
    private EmployeeEntity employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ai_test_id")
    private AiTest aiTest;

    // Linked to the skill assignment (optional — for skill verification)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_assignment_id")
    private SkillAssignment skillAssignment;

    private LocalDateTime assignedAt;
    private LocalDateTime deadline;
    private LocalDateTime submittedAt;

    // STATUS: ASSIGNED | SUBMITTED | GRADED | VERIFIED | REJECTED
    private String status = "ASSIGNED";

    // AI-graded score (0-100)
    private Double aiScore;

    // Answers submitted by employee: JSON string of questionId -> selectedOption
    @Column(columnDefinition = "TEXT")
    private String submittedAnswers;

    // AI-generated feedback/result summary
    @Column(columnDefinition = "TEXT")
    private String aiFeedback;

    // Admin can override AI decision
    private Boolean adminVerified;
    private String adminNote;

    // Skill verified based on score threshold
    private Boolean skillVerified = false;

    // ===== GETTERS =====
    public Long getId() { return id; }
    public EmployeeEntity getEmployee() { return employee; }
    public AiTest getAiTest() { return aiTest; }
    public SkillAssignment getSkillAssignment() { return skillAssignment; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public LocalDateTime getDeadline() { return deadline; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public String getStatus() { return status; }
    public Double getAiScore() { return aiScore; }
    public String getSubmittedAnswers() { return submittedAnswers; }
    public String getAiFeedback() { return aiFeedback; }
    public Boolean getAdminVerified() { return adminVerified; }
    public String getAdminNote() { return adminNote; }
    public Boolean getSkillVerified() { return skillVerified; }

    // ===== SETTERS =====
    public void setId(Long id) { this.id = id; }
    public void setEmployee(EmployeeEntity employee) { this.employee = employee; }
    public void setAiTest(AiTest aiTest) { this.aiTest = aiTest; }
    public void setSkillAssignment(SkillAssignment skillAssignment) { this.skillAssignment = skillAssignment; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public void setStatus(String status) { this.status = status; }
    public void setAiScore(Double aiScore) { this.aiScore = aiScore; }
    public void setSubmittedAnswers(String submittedAnswers) { this.submittedAnswers = submittedAnswers; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }
    public void setAdminVerified(Boolean adminVerified) { this.adminVerified = adminVerified; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    public void setSkillVerified(Boolean skillVerified) { this.skillVerified = skillVerified; }
}
