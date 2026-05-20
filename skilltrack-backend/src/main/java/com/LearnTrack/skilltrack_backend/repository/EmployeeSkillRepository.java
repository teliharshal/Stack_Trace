package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.EmployeeSkillEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkillEntity , Long> {
    List<EmployeeSkillEntity> findByEmployeeId(Long employeeId);

    List<EmployeeSkillEntity> findByEmployeeIdAndStatus(Long employeeId, String status);

    List<EmployeeSkillEntity> findByStatus(String status);

    boolean existsByEmployee_IdAndSkillNameIgnoreCase(Long employeeId, String skillName);

    @Modifying
    @Transactional
    @Query("DELETE FROM EmployeeSkillEntity e WHERE e.employee.id = :employeeId")
    void deleteByEmployeeId(@Param("employeeId") Long employeeId);
}
