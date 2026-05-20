package com.LearnTrack.skilltrack_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "employee_skill_entity")
public class EmployeeSkillEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

//    @Column(name = "employee_id", insertable = false, updatable = false)
//    private Long employeeId;

    private String skillName;

    private String category;

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    @Column(name = "level")
    private String level;

    private int progressPercentage;

//    @Column(columnDefinition = "LONGTEXT")
//    private String topics;

    private LocalDate startDate;

    public LocalDate getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDate completedAt) {
        this.completedAt = completedAt;
    }

    public void setTargetDurationDays(Integer targetDurationDays) {
        this.targetDurationDays = targetDurationDays;
    }

    private LocalDate completedAt;

    public void setEndDate(LocalDate enDate) {
        this.endDate = enDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    private LocalDate endDate;

    private String status;

    @JsonIgnoreProperties({"skills"})   // 🔥 PREVENT LOOP
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private EmployeeEntity employee;

    public void setEmployee(EmployeeEntity employee) {
        this.employee = employee;
    }

    public EmployeeEntity getEmployee() {
        return employee;
    }

    // ADD THIS FIELD
    private Integer targetDurationDays;

    @Column(columnDefinition = "LONGTEXT")
    private String completedTopics;

    @Column(columnDefinition = "LONGTEXT")
    private String topicLinks;

    // getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

//    public Long getEmployeeId() {
//        return employeeId;
//    }
//
//    public void setEmployeeId(Long employeeId) {
//        this.employeeId = employeeId;
//    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

//    public String getTopics() {
//        return topics;
//    }
//
//    public void setTopics(String topics) {
//        this.topics = topics;
//    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // NEW FIELD GETTER/SETTER
    public int getTargetDurationDays() {
        return targetDurationDays;
    }

    public void setTargetDurationDays(int targetDurationDays) {
        this.targetDurationDays = targetDurationDays;
    }

    public String getCompletedTopics() {
        return completedTopics;
    }

    public void setCompletedTopics(String completedTopics) {
        this.completedTopics = completedTopics;
    }

    public String getTopicLinks() {
        return topicLinks;
    }

    public void setTopicLinks(String topicLinks) {
        this.topicLinks = topicLinks;
    }
}
