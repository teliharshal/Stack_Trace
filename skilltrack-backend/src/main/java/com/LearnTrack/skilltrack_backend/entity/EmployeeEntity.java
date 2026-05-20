package com.LearnTrack.skilltrack_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

import java.util.List;

@Getter
@Entity
@Data
public class EmployeeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public String getName() {
        return name;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getDepartment() {
        return department;
    }

    public String getDesignation() {
        return designation;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getPassword() {
        return password;
    }

    public List<SkillAssignment> getAssignments() {
        return assignments;
    }

    public EmployeeEntity getReportsTo() {
        return reportsTo;
    }

    public Long getReportsToId() {
        return reportsTo != null ? reportsTo.getId() : null;
    }

    public String getReportsToName() {
        return reportsTo != null ? reportsTo.getName() : null;
    }

    private String name;
    private String email;
    private String department;
    private String designation;
    private String mobileNumber;
    private String role;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reports_to_id")
    private EmployeeEntity reportsTo;

    @JsonIgnore
    @OneToMany(mappedBy = "reportsTo")
    private List<EmployeeEntity> directReports;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Column(name = "password")
    private String password;
//
//    @JsonIgnore   // 🔥 ADD THIS
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SkillAssignment> assignments;


    public void setAssignments(List<SkillAssignment> assignments) {
        this.assignments = assignments;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setId(Long id) {
        this.id = id;
    }

//    public void setName(String name) {
//        this.name = name;
//    }
//
//    public void setEmail(String email) {
//        this.email = email;
//    }
//
//    public void setDepartment(String department) {
//        this.department = department;
//    }
//
//    public void setDesignation(String designation) {
//        this.designation = designation;
//    }
//
//    public void setMobileNumber(String mobileNumber) {
//        this.mobileNumber = mobileNumber;
//    }
//
//    public void setRole(String role) {
//        this.role = role;
//    }
//
//    public void setAvatarUrl(String avatarUrl) {
//        this.avatarUrl = avatarUrl;
//    }
//
//    public void setReportsTo(EmployeeEntity reportsTo) {
//        this.reportsTo = reportsTo;
//    }

}
