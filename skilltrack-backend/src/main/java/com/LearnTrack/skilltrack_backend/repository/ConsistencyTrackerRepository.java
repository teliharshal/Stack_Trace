package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.ConsitencyTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ConsistencyTrackerRepository extends JpaRepository<ConsitencyTracker , Long> {

    List<ConsitencyTracker> findByEmployeeIdOrderByDateDesc(Long employeeId);
    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);
    List<ConsitencyTracker> findByEmployeeId(Long employeeId);

}
