package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class EmployeeDetailsDTO {

    private String name;
    private String email;
    private String avatarUrl;
    private String designation;
    private String role;

    private int totalSkills;
    private int completed;
    private int inProgress;

    private List<SkillDto> inProgressSkills;
    private List<SkillDto> completedSkills;
}