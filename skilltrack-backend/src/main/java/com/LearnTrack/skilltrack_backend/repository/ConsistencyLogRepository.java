package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.ConsistencyLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ConsistencyLogRepository extends JpaRepository<ConsistencyLog, Integer> {

    List<ConsistencyLog> findByEmployeeId(Long employeeId);

    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);

}