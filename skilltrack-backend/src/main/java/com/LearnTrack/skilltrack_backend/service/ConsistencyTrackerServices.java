package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.entity.ConsistencyLog;
import com.LearnTrack.skilltrack_backend.entity.ConsitencyTracker;
import com.LearnTrack.skilltrack_backend.entity.SkillAssignment;
import com.LearnTrack.skilltrack_backend.repository.ConsistencyLogRepository;
import com.LearnTrack.skilltrack_backend.repository.ConsistencyTrackerRepository;
import com.LearnTrack.skilltrack_backend.repository.SkillAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ConsistencyTrackerServices {

    @Autowired
    private ConsistencyLogRepository logRepository;

    @Autowired
    private ConsistencyTrackerRepository consistencyTrackerRepository;

    @Autowired
    private SkillAssignmentRepository skillAssignmentRepository;

    @Autowired
    private SkillService skillService;

    public List<ConsitencyTracker> getConsistency(Long employeeId) {
        return consistencyTrackerRepository.findByEmployeeId(employeeId);
    }

    public ConsitencyTracker markStudy(ConsitencyTracker tracker) {
        LocalDate today = LocalDate.now();

        boolean exists = consistencyTrackerRepository
                .existsByEmployeeIdAndDate(tracker.getEmployeeId(), today);

        if (exists) {
            throw new RuntimeException("Already marked for today");
        }

        tracker.setDate(today);
        tracker.setStudied(true);

        return consistencyTrackerRepository.save(tracker);
    }

    public int getLearningStreak(Long employeeId) {
        List<ConsitencyTracker> records =
                consistencyTrackerRepository.findByEmployeeIdOrderByDateDesc(employeeId);

        if (records.isEmpty()) return 0;

        int streak = 0;
        LocalDate expectedDate = LocalDate.now();

        for (ConsitencyTracker record : records) {
            if (!record.isStudied()) break;

            if (record.getDate().equals(expectedDate)) {
                streak++;
                expectedDate = expectedDate.minusDays(1);
            } else {
                break;
            }
        }

        return streak;
    }

    private void markStudiedIfNotExists(Long employeeId, LocalDate date) {
        boolean exists = consistencyTrackerRepository
                .existsByEmployeeIdAndDate(employeeId, date);

        if (!exists) {
            ConsitencyTracker tracker = new ConsitencyTracker();
            tracker.setEmployeeId(employeeId);
            tracker.setDate(date);
            tracker.setStudied(true);
            consistencyTrackerRepository.save(tracker);
        }
    }

    public String addLog(ConsistencyLog log) {

        if (log.getSkillId() == null) {
            throw new RuntimeException("skillId is required");
        }

        if (log.getEmployeeId() <= 0) {
            throw new RuntimeException("employeeId is required");
        }

        if (log.getDate() == null) {
            log.setDate(LocalDate.now());
        }

        // ✅ Fetch assignment
        SkillAssignment assignment = skillAssignmentRepository
                .findById(log.getSkillId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // ✅ USER CONTROLLED PROGRESS
        int increment = log.getProgressIncrement();

        if (assignment.getProgress() >= 100) {
            throw new RuntimeException("Skill already completed");
        }

        if (increment > 30) {
            throw new RuntimeException("Max 30% allowed per day");
        }

        if (increment <= 0) {
            throw new RuntimeException("Invalid progress value");
        }

        // ✅ LIMIT PROGRESS
        int newProgress = Math.min(assignment.getProgress() + increment, 100);

        assignment.setProgress(newProgress);
        skillAssignmentRepository.save(assignment);

        // ✅ Save log
        logRepository.save(log);

        // ✅ Streak
        markStudiedIfNotExists(log.getEmployeeId(), log.getDate());

        return "Log added successfully";
    }

    public List<ConsistencyLog> getLogs(Long employeeId) {
        return logRepository.findByEmployeeId(employeeId);
    }

    public void deleteLog(Integer id) {
        logRepository.deleteById(id);
    }
}
