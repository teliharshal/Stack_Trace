package com.LearnTrack.skilltrack_backend.repository;

import com.LearnTrack.skilltrack_backend.entity.AiTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiTestRepository extends JpaRepository<AiTest, Long> {
    List<AiTest> findByTechnologyIgnoreCaseAndCategoryIgnoreCase(String technology, String category);
    List<AiTest> findByTechnologyIgnoreCase(String technology);
}
