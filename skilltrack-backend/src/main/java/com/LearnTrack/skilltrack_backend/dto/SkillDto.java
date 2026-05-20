package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SkillDto {

    private Long id;
    private String skillName;
    private int progressPercentage;

    // Certificate
    private String certificateUrl;
    private Boolean certificateUploaded;
    private Boolean certificateVerified;

    // Test
    private String testLink;
    private String resultLink;
    private Double testScore;
    private Boolean adminApproved;

    private String testStatus;
    private String rejectReason;
}