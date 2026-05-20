package com.LearnTrack.skilltrack_backend.entity;

import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.SkillEntity;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
public class SkillAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ================= RELATIONS =================
    @ManyToOne
    @JoinColumn(name = "employee_id")
    @JsonBackReference
    private EmployeeEntity employee;

    @ManyToOne
    @JoinColumn(name = "skill_id")
    private SkillEntity skill;

    // ================= DATES =================
    private LocalDateTime startDate;
    private LocalDateTime deadline;

    // ================= PROGRESS =================
    private int progress = 0;
    private String status;

    // ================= CERTIFICATE =================
    private String certificateUrl;
    private Boolean certificateUploaded = false;
    private Boolean certificateVerified = false;

    // ================= TEST =================
    private String testLink;
    private String resultLink;
    private Double testScore;

    private String testStatus; // ASSIGNED, SUBMITTED, VERIFIED, REJECTED
    private Boolean adminApproved;
    private String rejectReason;

    private int attemptCount = 0;

    // ================= GETTERS =================

    public Long getId() { return id; }

    public EmployeeEntity getEmployee() { return employee; }
    public SkillEntity getSkill() { return skill; }

    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getDeadline() { return deadline; }

    public int getProgress() { return progress; }
    public String getStatus() { return status; }

    public String getCertificateUrl() { return certificateUrl; }
    public Boolean getCertificateUploaded() { return certificateUploaded; }
    public Boolean getCertificateVerified() { return certificateVerified; }

    public String getTestLink() { return testLink; }
    public String getResultLink() { return resultLink; }
    public Double getTestScore() { return testScore; }

    public String getTestStatus() { return testStatus; }
    public Boolean getAdminApproved() { return adminApproved; }
    public String getRejectReason() { return rejectReason; }

    public int getAttemptCount() { return attemptCount; }

    // ================= SETTERS =================

    public void setId(Long id) { this.id = id; }

    public void setEmployee(EmployeeEntity employee) { this.employee = employee; }
    public void setSkill(SkillEntity skill) { this.skill = skill; }

    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public void setProgress(int progress) { this.progress = progress; }
    public void setStatus(String status) { this.status = status; }

    public void setCertificateUrl(String certificateUrl) { this.certificateUrl = certificateUrl; }
    public void setCertificateUploaded(Boolean certificateUploaded) { this.certificateUploaded = certificateUploaded; }
    public void setCertificateVerified(Boolean certificateVerified) { this.certificateVerified = certificateVerified; }

    public void setTestLink(String testLink) { this.testLink = testLink; }
    public void setResultLink(String resultLink) { this.resultLink = resultLink; }
    public void setTestScore(Double testScore) { this.testScore = testScore; }

    public void setTestStatus(String testStatus) { this.testStatus = testStatus; }
    public void setAdminApproved(Boolean adminApproved) { this.adminApproved = adminApproved; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public void setAttemptCount(int attemptCount) { this.attemptCount = attemptCount; }
}