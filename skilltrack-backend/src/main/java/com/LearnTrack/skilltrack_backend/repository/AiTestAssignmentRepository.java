package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.AiTestAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiTestAssignmentRepository extends JpaRepository<AiTestAssignment, Long> {
    List<AiTestAssignment> findByEmployeeId(Long employeeId);
    List<AiTestAssignment> findByStatus(String status);
    List<AiTestAssignment> findByEmployeeIdAndStatus(Long employeeId, String status);
}
