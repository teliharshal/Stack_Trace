package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class EmployeeOverviewDto {
    public Long getEmployeeId() {
        return employeeId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getDesignation() {
        return designation;
    }

    public String getRole() {
        return role;
    }

    public String getDepartment() {
        return department;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public Long getReportsToId() {
        return reportsToId;
    }

    public String getReportsToName() {
        return reportsToName;
    }

    public int getTotalSkills() {
        return totalSkills;
    }

    public int getCompleted() {
        return completed;
    }

    public int getInProgress() {
        return inProgress;
    }

    public List<String> getCurrentSkills() {
        return currentSkills;
    }

    private Long employeeId;

    public void setInProgress(int inProgress) {
        this.inProgress = inProgress;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public void setReportsToId(Long reportsToId) {
        this.reportsToId = reportsToId;
    }

    public void setReportsToName(String reportsToName) {
        this.reportsToName = reportsToName;
    }

    public void setTotalSkills(int totalSkills) {
        this.totalSkills = totalSkills;
    }

    public void setCompleted(int completed) {
        this.completed = completed;
    }

    public void setCurrentSkills(List<String> currentSkills) {
        this.currentSkills = currentSkills;
    }

    private String name;
    private String email;
    private String avatarUrl;
    private String designation;
    private String role;
    private String department;
    private String mobileNumber;
    private Long reportsToId;
    private String reportsToName;

    private int totalSkills;
    private int completed;
    private int inProgress;

    private List<String> currentSkills;
}
