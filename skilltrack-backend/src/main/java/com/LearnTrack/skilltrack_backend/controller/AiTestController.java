package com.LearnTrack.skilltrack_backend.controller;

import com.LearnTrack.skilltrack_backend.dto.AiTestResultDto;
import com.LearnTrack.skilltrack_backend.dto.AssignAiTestRequest;
import com.LearnTrack.skilltrack_backend.dto.GenerateTestRequest;
import com.LearnTrack.skilltrack_backend.dto.SubmitTestRequest;
import com.LearnTrack.skilltrack_backend.entity.AiTest;
import com.LearnTrack.skilltrack_backend.entity.AiTestAssignment;
import com.LearnTrack.skilltrack_backend.service.AiTestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for AI-powered test generation, assignment, submission, and grading.
 *
 * Admin endpoints:  POST /api/ai-test/generate
 *                   POST /api/ai-test/assign
 *                   GET  /api/ai-test/all
 *                   GET  /api/ai-test/assignments
 *                   GET  /api/ai-test/result/{assignmentId}
 *                   PUT  /api/ai-test/verify/{assignmentId}
 *                   DELETE /api/ai-test/{id}
 *
 * Employee endpoints: GET  /api/ai-test/my-assignments/{employeeId}
 *                     GET  /api/ai-test/take/{assignmentId}
 *                     POST /api/ai-test/submit/{assignmentId}
 *                     GET  /api/ai-test/my-result/{assignmentId}
 */
@RestController
@RequestMapping("/api/ai-test")
@CrossOrigin(origins = "http://localhost:5173")
public class AiTestController {

    @Autowired
    private AiTestService aiTestService;

    // =========================================================
    // ADMIN — GENERATE TEST
    // =========================================================

    /**
     * Admin generates a new AI test based on technology, category, difficulty, and question count.
     */
    @PostMapping("/generate")
    public ResponseEntity<AiTest> generateTest(@RequestBody GenerateTestRequest request) {
        AiTest test = aiTestService.generateTest(request);
        return ResponseEntity.ok(test);
    }

    /**
     * Get all generated AI tests.
     */
    @GetMapping("/all")
    public ResponseEntity<List<AiTest>> getAllTests() {
        return ResponseEntity.ok(aiTestService.getAllTests());
    }

    /**
     * Get a specific AI test with all questions.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AiTest> getTest(@PathVariable Long id) {
        return ResponseEntity.ok(aiTestService.getTestById(id));
    }

    /**
     * Delete a generated test.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTest(@PathVariable Long id) {
        aiTestService.deleteTest(id);
        return ResponseEntity.ok("Test deleted successfully");
    }

    // =========================================================
    // ADMIN — ASSIGN TEST TO EMPLOYEE
    // =========================================================

    /**
     * Admin assigns a generated test to an employee.
     */
    @PostMapping("/assign")
    public ResponseEntity<AiTestAssignment> assignTest(@RequestBody AssignAiTestRequest request) {
        AiTestAssignment assignment = aiTestService.assignTest(request);
        return ResponseEntity.ok(assignment);
    }

    /**
     * Get all test assignments (admin view).
     */
    @GetMapping("/assignments")
    public ResponseEntity<List<AiTestAssignment>> getAllAssignments() {
        return ResponseEntity.ok(aiTestService.getAllAssignments());
    }

    /**
     * Get assignments pending grading (status = SUBMITTED).
     */
    @GetMapping("/assignments/pending")
    public ResponseEntity<List<AiTestAssignment>> getPendingGrading() {
        return ResponseEntity.ok(aiTestService.getPendingGrading());
    }

    /**
     * Get AI-graded result for an assignment (admin view with full question breakdown).
     */
    @GetMapping("/result/{assignmentId}")
    public ResponseEntity<AiTestResultDto> getResult(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(aiTestService.getResult(assignmentId));
    }

    /**
     * Admin manually verifies or rejects a graded test result.
     */
    @PutMapping("/verify/{assignmentId}")
    public ResponseEntity<AiTestAssignment> adminVerify(
            @PathVariable Long assignmentId,
            @RequestParam boolean approved,
            @RequestParam(required = false, defaultValue = "") String note
    ) {
        return ResponseEntity.ok(aiTestService.adminVerify(assignmentId, approved, note));
    }

    // =========================================================
    // EMPLOYEE — TAKE & SUBMIT TEST
    // =========================================================

    /**
     * Get all AI test assignments for an employee.
     */
    @GetMapping("/my-assignments/{employeeId}")
    public ResponseEntity<List<AiTestAssignment>> getMyAssignments(@PathVariable Long employeeId) {
        return ResponseEntity.ok(aiTestService.getAssignmentsByEmployee(employeeId));
    }

    /**
     * Employee fetches the test to attempt (questions WITHOUT correct answers).
     * Correct answers are stripped from the response for security.
     */
    @GetMapping("/take/{assignmentId}")
    public ResponseEntity<Map<String, Object>> takeTest(@PathVariable Long assignmentId) {

        AiTestAssignment assignment = aiTestService.getAllAssignments()
            .stream()
            .filter(a -> a.getId().equals(assignmentId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        AiTest test = assignment.getAiTest();

        // Build response without correct answers
        List<Map<String, Object>> questions = test.getQuestions().stream()
            .map(q -> {
                String[] opts = q.getOptions() != null ? q.getOptions().split("\\|\\|") : new String[]{};
                return Map.<String, Object>of(
                    "id", q.getId(),
                    "questionText", q.getQuestionText(),
                    "optionA", opts.length > 0 ? opts[0] : "",
                    "optionB", opts.length > 1 ? opts[1] : "",
                    "optionC", opts.length > 2 ? opts[2] : "",
                    "optionD", opts.length > 3 ? opts[3] : ""
                );
            })
            .toList();

        Map<String, Object> response = Map.of(
            "assignmentId", assignment.getId(),
            "technology", test.getTechnology(),
            "category", test.getCategory(),
            "difficulty", test.getDifficulty(),
            "totalQuestions", test.getQuestionCount(),
            "status", assignment.getStatus(),
            "deadline", assignment.getDeadline() != null ? assignment.getDeadline().toString() : "",
            "questions", questions
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Employee submits answers. AI auto-grades immediately and returns result.
     */
    @PostMapping("/submit/{assignmentId}")
    public ResponseEntity<AiTestResultDto> submitTest(
            @PathVariable Long assignmentId,
            @RequestBody SubmitTestRequest request
    ) {
        AiTestResultDto result = aiTestService.submitTest(assignmentId, request.getAnswers());
        return ResponseEntity.ok(result);
    }

    /**
     * Employee views their result after submission.
     */
    @GetMapping("/my-result/{assignmentId}")
    public ResponseEntity<AiTestResultDto> getMyResult(@PathVariable Long assignmentId) {
        return ResponseEntity.ok(aiTestService.getResult(assignmentId));
    }
}
