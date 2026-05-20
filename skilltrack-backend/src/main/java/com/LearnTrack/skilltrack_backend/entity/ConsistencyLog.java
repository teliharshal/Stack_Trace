package com.LearnTrack.skilltrack_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consistency_logs")
public class ConsistencyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private int employeeId;

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public void setId(int id) {
        this.id = id;
    }

    private Long skillId;

    public Long getSkillId() {
        return skillId;
    }

    private LocalDate date;

    private Double hoursStudied;

    private String technology;



    private Integer progressIncrement;

    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters & Setters
    public int getId() { return id; }

    public long getEmployeeId() { return employeeId; }
    public void setEmployeeId(int employeeId) { this.employeeId = employeeId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Double getHoursStudied() { return hoursStudied; }
    public void setHoursStudied(Double hoursStudied) { this.hoursStudied = hoursStudied; }

    public String getTechnology() { return technology; }
    public void setTechnology(String technology) { this.technology = technology; }

    public Integer getProgressIncrement() { return progressIncrement; }
    public void setProgressIncrement(Integer progressIncrement) { this.progressIncrement = progressIncrement; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}