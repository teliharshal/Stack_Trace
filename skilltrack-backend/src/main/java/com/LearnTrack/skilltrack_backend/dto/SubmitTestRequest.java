package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;
import java.util.Map;

/**
 * Request body for employee to submit test answers.
 * answers: Map of questionId (String) -> selected option key ("A", "B", "C", "D")
 */
@Data
public class SubmitTestRequest {
    private Map<String, String> answers;
}
