package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.EmployeeInvite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.Optional;

public interface InviteResitory extends JpaRepository<EmployeeInvite , Long> {
    Optional<EmployeeInvite> findByToken(String token);


}
