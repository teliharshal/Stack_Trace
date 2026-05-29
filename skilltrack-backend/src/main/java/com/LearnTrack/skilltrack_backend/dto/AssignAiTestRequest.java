package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;

/**
 * Request body for admin to assign a generated AI test to an employee.
 */
@Data
public class AssignAiTestRequest {
    private Long aiTestId;
    private Long employeeId;
    private Long skillAssignmentId;  // optional: link to existing skill assignment
    private String deadline;         // ISO datetime string
}
