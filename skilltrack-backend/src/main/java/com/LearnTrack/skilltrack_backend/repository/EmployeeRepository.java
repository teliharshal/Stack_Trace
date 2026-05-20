package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long> {
    Optional<EmployeeEntity> findByEmail(String email);
    List<EmployeeEntity> findByReportsTo_Id(Long reportsToId);
    boolean existsByEmail(String email);
    @Query("SELECT e FROM EmployeeEntity e LEFT JOIN FETCH e.assignments")
    List<EmployeeEntity> findAllWithSkills();

    @Modifying
    @Transactional
    @Query("DELETE FROM EmployeeSkillEntity e WHERE e.employee.id = :employeeId")
    void deleteByEmployeeId(@Param("employeeId") Long employeeId);
}
