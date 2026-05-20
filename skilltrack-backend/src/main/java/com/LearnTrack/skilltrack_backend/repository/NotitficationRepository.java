package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotitficationRepository extends JpaRepository<Notification,Long> {
     List<Notification> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}

