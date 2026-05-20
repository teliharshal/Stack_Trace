package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.SkillAssignment;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SkillAssignmentRepository extends JpaRepository<SkillAssignment, Long> {
    List<SkillAssignment> findByEmployeeId(Long EmployeeId);
    @Modifying
    @Transactional
    @Query("DELETE FROM SkillAssignment e WHERE e.employee.id = :employeeId")
    void deleteByEmployeeId(@Param("employeeId") Long employeeId);
}
