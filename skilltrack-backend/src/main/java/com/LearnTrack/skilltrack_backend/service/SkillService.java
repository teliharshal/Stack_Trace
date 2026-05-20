package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.EmployeeSkillEntity;
import com.LearnTrack.skilltrack_backend.entity.SkillEntity;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.EmployeeSkillRepository;
import com.LearnTrack.skilltrack_backend.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    // ✅ ADD SKILL TO EMPLOYEE
    public EmployeeSkillEntity addSkill(EmployeeSkillEntity skill) {

        if (skill.getEmployee() == null || skill.getEmployee().getId() == null) {
            throw new RuntimeException("Employee ID is required");
        }

        Long employeeId = skill.getEmployee().getId();
        String normalizedName = skill.getSkillName().trim();

        EmployeeEntity employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        boolean exists = employeeSkillRepository
                .existsByEmployee_IdAndSkillNameIgnoreCase(employeeId, normalizedName);

        if (exists) {
            throw new RuntimeException("Skill already exists");
        }

        skill.setSkillName(normalizedName);
        skill.setEmployee(employee);
        skill.setStartDate(LocalDate.now());

        if (skill.getProgressPercentage() == 100) {
            skill.setStatus("COMPLETED");
            skill.setCompletedAt(LocalDate.now());
        } else {
            skill.setStatus("IN_PROGRESS");
        }

        return employeeSkillRepository.save(skill);
    }

    // ✅ GET ALL CATALOG SKILLS
    public List<SkillEntity> getSkill() {
        return skillRepository.findAll();
    }

    // ✅ ADD SKILL IN CATALOG
    public SkillEntity addCatalogSkill(SkillEntity skill) {

        if (skill.getSkillName() == null || skill.getSkillName().isBlank()) {
            throw new RuntimeException("Skill name is required");
        }

        String name = skill.getSkillName().trim();
        String category = skill.getCategory() == null ? "" : skill.getCategory().trim();

        boolean exists = skillRepository
                .existsBySkillNameIgnoreCaseAndCategoryIgnoreCase(name, category);

        if (exists) {
            throw new RuntimeException("Skill already exists");
        }

        skill.setSkillName(name);
        skill.setCategory(category);
        skill.setCourseLink(
                skill.getCourseLink() == null ? "" : skill.getCourseLink().trim()
        );

        return skillRepository.save(skill);
    }

    // ✅ UPDATE SKILL
    public SkillEntity updateCatalogSkill(Long id, SkillEntity incoming) {

        SkillEntity existing = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        String name = incoming.getSkillName() == null || incoming.getSkillName().isBlank()
                ? existing.getSkillName()
                : incoming.getSkillName().trim();

        String category = incoming.getCategory() == null || incoming.getCategory().isBlank()
                ? existing.getCategory()
                : incoming.getCategory().trim();

        existing.setSkillName(name);
        existing.setCategory(category);
        existing.setCourseLink(
                incoming.getCourseLink() == null
                        ? existing.getCourseLink()
                        : incoming.getCourseLink().trim()
        );

        return skillRepository.save(existing);
    }

    // ✅ DELETE SKILL
    public void deleteCatalogSkill(Long id) {
        if (!skillRepository.existsById(id)) {
            throw new RuntimeException("Skill not found");
        }
        skillRepository.deleteById(id);
    }

    // ✅ DASHBOARD HELPERS
    public Long getTotalSkills() {
        return skillRepository.count();
    }

    public List<EmployeeSkillEntity> getInProgressStatus(Long employeeId) {
        return employeeSkillRepository.findByEmployeeIdAndStatus(employeeId, "IN_PROGRESS");
    }

    public List<EmployeeSkillEntity> getCompletedStatus(Long employeeId) {
        return employeeSkillRepository.findByEmployeeIdAndStatus(employeeId, "COMPLETED");
    }

    // ✅ REMAINING DAYS
    public Long getRemainingDays(Long id) {
        EmployeeSkillEntity skill = employeeSkillRepository.findById(id).orElseThrow();
        return ChronoUnit.DAYS.between(LocalDate.now(), skill.getEndDate());
    }

    // ✅ UPDATE PROGRESS
    public void updateSkillProgress(Long skillId, int increment) {

        EmployeeSkillEntity skill = employeeSkillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        int newProgress = skill.getProgressPercentage() + increment;

        if (newProgress > 100) newProgress = 100;

        skill.setProgressPercentage(newProgress);

        if (newProgress == 100) {
            skill.setStatus("COMPLETED");
            skill.setCompletedAt(LocalDate.now());
        }

        employeeSkillRepository.save(skill);
    }
}