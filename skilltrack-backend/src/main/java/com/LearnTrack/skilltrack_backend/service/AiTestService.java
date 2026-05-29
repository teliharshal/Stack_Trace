package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.dto.AiTestResultDto;
import com.LearnTrack.skilltrack_backend.dto.AssignAiTestRequest;
import com.LearnTrack.skilltrack_backend.dto.GenerateTestRequest;
import com.LearnTrack.skilltrack_backend.entity.*;
import com.LearnTrack.skilltrack_backend.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Core service for AI-powered test generation, assignment, submission, and auto-grading.
 */
@Service
public class AiTestService {

    // Minimum score (%) to auto-verify a skill
    private static final double PASS_THRESHOLD = 70.0;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private AiTestRepository aiTestRepository;

    @Autowired
    private AiTestAssignmentRepository aiTestAssignmentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillAssignmentRepository skillAssignmentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // =========================================================
    // 1. GENERATE TEST (Admin)
    // =========================================================

    public AiTest generateTest(GenerateTestRequest request) {

        int count = request.getQuestionCount() > 0 ? request.getQuestionCount() : 10;
        String difficulty = request.getDifficulty() != null ? request.getDifficulty() : "MEDIUM";

        String prompt = buildGenerationPrompt(
            request.getTechnology(),
            request.getCategory(),
            difficulty,
            count
        );

        String rawResponse = geminiService.generateContent(prompt);

        // Parse the JSON array of questions from Gemini response
        List<Map<String, Object>> parsedQuestions = parseQuestionsFromResponse(rawResponse);

        // Build and save AiTest entity
        AiTest test = new AiTest();
        test.setTechnology(request.getTechnology());
        test.setCategory(request.getCategory());
        test.setDifficulty(difficulty);
        test.setQuestionCount(parsedQuestions.size());
        test.setGeneratedAt(LocalDateTime.now());

        if (request.getSkillId() != null) {
            skillRepository.findById(request.getSkillId())
                .ifPresent(test::setSkill);
        }

        // Build question entities
        List<AiTestQuestion> questions = new ArrayList<>();
        for (Map<String, Object> q : parsedQuestions) {
            AiTestQuestion question = new AiTestQuestion();
            question.setAiTest(test);
            question.setQuestionText(getString(q, "question"));
            question.setOptions(buildOptionsString(q));
            question.setCorrectAnswer(getString(q, "correctAnswer"));
            question.setExplanation(getString(q, "explanation"));
            questions.add(question);
        }

        test.setQuestions(questions);
        return aiTestRepository.save(test);
    }

    // =========================================================
    // 2. ASSIGN TEST TO EMPLOYEE (Admin)
    // =========================================================

    public AiTestAssignment assignTest(AssignAiTestRequest request) {

        AiTest test = aiTestRepository.findById(request.getAiTestId())
            .orElseThrow(() -> new RuntimeException("AI Test not found"));

        EmployeeEntity employee = employeeRepository.findById(request.getEmployeeId())
            .orElseThrow(() -> new RuntimeException("Employee not found"));

        AiTestAssignment assignment = new AiTestAssignment();
        assignment.setAiTest(test);
        assignment.setEmployee(employee);
        assignment.setAssignedAt(LocalDateTime.now());
        assignment.setStatus("ASSIGNED");

        if (request.getDeadline() != null && !request.getDeadline().isBlank()) {
            assignment.setDeadline(LocalDateTime.parse(request.getDeadline()));
        }

        if (request.getSkillAssignmentId() != null) {
            skillAssignmentRepository.findById(request.getSkillAssignmentId())
                .ifPresent(assignment::setSkillAssignment);
        }

        return aiTestAssignmentRepository.save(assignment);
    }

    // =========================================================
    // 3. SUBMIT TEST ANSWERS (Employee)
    // =========================================================

    public AiTestResultDto submitTest(Long assignmentId, Map<String, String> answers) {

        AiTestAssignment assignment = aiTestAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if ("GRADED".equals(assignment.getStatus()) || "VERIFIED".equals(assignment.getStatus())) {
            throw new RuntimeException("Test already submitted and graded");
        }

        // Serialize answers to JSON string for storage
        try {
            String answersJson = objectMapper.writeValueAsString(answers);
            assignment.setSubmittedAnswers(answersJson);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize answers");
        }

        assignment.setSubmittedAt(LocalDateTime.now());
        assignment.setStatus("SUBMITTED");
        aiTestAssignmentRepository.save(assignment);

        // Auto-grade immediately
        return autoGrade(assignment, answers);
    }

    // =========================================================
    // 4. AUTO-GRADE (AI-powered)
    // =========================================================

    public AiTestResultDto autoGrade(Long assignmentId) {
        AiTestAssignment assignment = aiTestAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (assignment.getSubmittedAnswers() == null) {
            throw new RuntimeException("No answers submitted yet");
        }

        try {
            Map<String, String> answers = objectMapper.readValue(
                assignment.getSubmittedAnswers(),
                new TypeReference<Map<String, String>>() {}
            );
            return autoGrade(assignment, answers);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse submitted answers", e);
        }
    }

    private AiTestResultDto autoGrade(AiTestAssignment assignment, Map<String, String> answers) {

        AiTest test = assignment.getAiTest();
        List<AiTestQuestion> questions = test.getQuestions();

        int correct = 0;
        List<AiTestResultDto.QuestionResultDto> questionResults = new ArrayList<>();

        for (AiTestQuestion q : questions) {
            String selected = answers.get(String.valueOf(q.getId()));
            boolean isCorrect = q.getCorrectAnswer() != null
                && q.getCorrectAnswer().equalsIgnoreCase(selected);

            if (isCorrect) correct++;

            AiTestResultDto.QuestionResultDto qr = new AiTestResultDto.QuestionResultDto();
            qr.setQuestionId(q.getId());
            qr.setQuestionText(q.getQuestionText());
            qr.setSelectedAnswer(selected);
            qr.setCorrectAnswer(q.getCorrectAnswer());
            qr.setCorrect(isCorrect);
            qr.setExplanation(q.getExplanation());
            questionResults.add(qr);
        }

        double score = questions.isEmpty() ? 0 :
            Math.round((correct * 100.0 / questions.size()) * 10.0) / 10.0;

        boolean skillVerified = score >= PASS_THRESHOLD;

        // Generate AI feedback
        String feedback = generateAiFeedback(
            test.getTechnology(),
            test.getCategory(),
            score,
            correct,
            questions.size(),
            skillVerified
        );

        // Update assignment
        assignment.setAiScore(score);
        assignment.setAiFeedback(feedback);
        assignment.setStatus("GRADED");
        assignment.setSkillVerified(skillVerified);
        aiTestAssignmentRepository.save(assignment);

        // If skill verified and linked to a SkillAssignment, update it
        if (skillVerified && assignment.getSkillAssignment() != null) {
            SkillAssignment sa = assignment.getSkillAssignment();
            sa.setTestStatus("VERIFIED");
            sa.setTestScore(score);
            sa.setAdminApproved(true);
            sa.setProgress(100);
            sa.setStatus("COMPLETED");
            skillAssignmentRepository.save(sa);
        }

        // Build result DTO
        AiTestResultDto result = new AiTestResultDto();
        result.setAssignmentId(assignment.getId());
        result.setEmployeeName(assignment.getEmployee().getName());
        result.setTechnology(test.getTechnology());
        result.setCategory(test.getCategory());
        result.setScore(score);
        result.setCorrectAnswers(correct);
        result.setTotalQuestions(questions.size());
        result.setAiFeedback(feedback);
        result.setSkillVerified(skillVerified);
        result.setStatus(assignment.getStatus());
        result.setQuestionResults(questionResults);

        return result;
    }

    // =========================================================
    // 5. GET RESULT (Admin / Employee)
    // =========================================================

    public AiTestResultDto getResult(Long assignmentId) {
        AiTestAssignment assignment = aiTestAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        if (assignment.getSubmittedAnswers() == null) {
            throw new RuntimeException("Test not yet submitted");
        }

        try {
            Map<String, String> answers = objectMapper.readValue(
                assignment.getSubmittedAnswers(),
                new TypeReference<Map<String, String>>() {}
            );

            AiTest test = assignment.getAiTest();
            List<AiTestQuestion> questions = test.getQuestions();
            int correct = 0;
            List<AiTestResultDto.QuestionResultDto> questionResults = new ArrayList<>();

            for (AiTestQuestion q : questions) {
                String selected = answers.get(String.valueOf(q.getId()));
                boolean isCorrect = q.getCorrectAnswer() != null
                    && q.getCorrectAnswer().equalsIgnoreCase(selected);
                if (isCorrect) correct++;

                AiTestResultDto.QuestionResultDto qr = new AiTestResultDto.QuestionResultDto();
                qr.setQuestionId(q.getId());
                qr.setQuestionText(q.getQuestionText());
                qr.setSelectedAnswer(selected);
                qr.setCorrectAnswer(q.getCorrectAnswer());
                qr.setCorrect(isCorrect);
                qr.setExplanation(q.getExplanation());
                questionResults.add(qr);
            }

            AiTestResultDto result = new AiTestResultDto();
            result.setAssignmentId(assignment.getId());
            result.setEmployeeName(assignment.getEmployee().getName());
            result.setTechnology(test.getTechnology());
            result.setCategory(test.getCategory());
            result.setScore(assignment.getAiScore());
            result.setCorrectAnswers(correct);
            result.setTotalQuestions(questions.size());
            result.setAiFeedback(assignment.getAiFeedback());
            result.setSkillVerified(Boolean.TRUE.equals(assignment.getSkillVerified()));
            result.setStatus(assignment.getStatus());
            result.setQuestionResults(questionResults);

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Failed to build result", e);
        }
    }

    // =========================================================
    // 6. ADMIN OVERRIDE VERIFICATION
    // =========================================================

    public AiTestAssignment adminVerify(Long assignmentId, boolean approved, String note) {
        AiTestAssignment assignment = aiTestAssignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setAdminVerified(approved);
        assignment.setAdminNote(note);
        assignment.setStatus(approved ? "VERIFIED" : "REJECTED");
        assignment.setSkillVerified(approved);

        // Sync with SkillAssignment if linked
        if (assignment.getSkillAssignment() != null) {
            SkillAssignment sa = assignment.getSkillAssignment();
            sa.setTestStatus(approved ? "VERIFIED" : "REJECTED");
            sa.setAdminApproved(approved);
            if (approved) {
                sa.setProgress(100);
                sa.setStatus("COMPLETED");
            }
            skillAssignmentRepository.save(sa);
        }

        return aiTestAssignmentRepository.save(assignment);
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private String buildGenerationPrompt(String technology, String category, String difficulty, int count) {
        return String.format("""
            You are an expert technical interviewer. Generate exactly %d multiple-choice questions to test knowledge of %s (%s category).
            Difficulty level: %s.
            
            Return ONLY a valid JSON array with no markdown, no code blocks, no extra text.
            Each object must have exactly these fields:
            - "question": the question text (string)
            - "optionA": option A text (string)
            - "optionB": option B text (string)
            - "optionC": option C text (string)
            - "optionD": option D text (string)
            - "correctAnswer": one of "A", "B", "C", "D" (string)
            - "explanation": brief explanation of the correct answer (string)
            
            Example format:
            [
              {
                "question": "What is the output of System.out.println(1 + 2 + '3')?",
                "optionA": "123",
                "optionB": "33",
                "optionC": "6",
                "optionD": "Compilation error",
                "correctAnswer": "B",
                "explanation": "1+2=3, then 3+'3' concatenates to '33' because char '3' is treated as int 51, giving 54... actually 3+51=54. Wait, the correct answer depends on context."
              }
            ]
            
            Generate %d questions now:
            """,
            count, technology, category, difficulty, count
        );
    }

    private List<Map<String, Object>> parseQuestionsFromResponse(String rawResponse) {
        try {
            // Clean up response — remove markdown code blocks if present
            String cleaned = rawResponse.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            }

            // Find the JSON array
            int start = cleaned.indexOf('[');
            int end = cleaned.lastIndexOf(']');
            if (start == -1 || end == -1) {
                throw new RuntimeException("No JSON array found in Gemini response");
            }
            cleaned = cleaned.substring(start, end + 1);

            return objectMapper.readValue(cleaned, new TypeReference<List<Map<String, Object>>>() {});

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse questions from AI response: " + e.getMessage(), e);
        }
    }

    private String buildOptionsString(Map<String, Object> q) {
        return getString(q, "optionA") + "||" +
               getString(q, "optionB") + "||" +
               getString(q, "optionC") + "||" +
               getString(q, "optionD");
    }

    private String getString(Map<String, Object> map, String key) {
        Object val = map.get(key);
        return val != null ? val.toString() : "";
    }

    private String generateAiFeedback(String technology, String category,
                                       double score, int correct, int total, boolean passed) {
        try {
            String prompt = String.format("""
                A candidate just completed a %s (%s) technical assessment.
                They scored %.1f%% (%d out of %d questions correct).
                Pass threshold is 70%%.
                Result: %s
                
                Write a brief, professional 2-3 sentence feedback message for the candidate.
                Be encouraging but honest. Do not use markdown formatting.
                """,
                technology, category, score, correct, total,
                passed ? "PASSED - Skill Verified" : "FAILED - Skill Not Verified"
            );

            return geminiService.generateContent(prompt);
        } catch (Exception e) {
            // Fallback feedback if AI call fails
            return passed
                ? String.format("Congratulations! You scored %.1f%% and have demonstrated proficiency in %s. Your skill has been verified.", score, technology)
                : String.format("You scored %.1f%% in %s. A minimum of 70%% is required to verify this skill. Please review the topics and try again.", score, technology);
        }
    }

    // =========================================================
    // QUERY METHODS
    // =========================================================

    public List<AiTest> getAllTests() {
        return aiTestRepository.findAll();
    }

    public AiTest getTestById(Long id) {
        return aiTestRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Test not found"));
    }

    public List<AiTestAssignment> getAssignmentsByEmployee(Long employeeId) {
        return aiTestAssignmentRepository.findByEmployeeId(employeeId);
    }

    public List<AiTestAssignment> getAllAssignments() {
        return aiTestAssignmentRepository.findAll();
    }

    public List<AiTestAssignment> getPendingGrading() {
        return aiTestAssignmentRepository.findByStatus("SUBMITTED");
    }

    public void deleteTest(Long id) {
        aiTestRepository.deleteById(id);
    }
}
