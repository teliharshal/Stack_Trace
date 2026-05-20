package com.LearnTrack.skilltrack_backend.repository;


import com.LearnTrack.skilltrack_backend.entity.SkillEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository  extends JpaRepository<SkillEntity,Long> {
    boolean existsBySkillNameIgnoreCase(String skillName);
    boolean existsBySkillNameIgnoreCaseAndCategoryIgnoreCase(String skillName, String category);
}
