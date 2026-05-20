package com.LearnTrack.skilltrack_backend.service;


import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.SkillAssignment;
import com.LearnTrack.skilltrack_backend.entity.SkillEntity;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.SkillAssignmentRepository;
import com.LearnTrack.skilltrack_backend.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SkillAssignmentSerivices {

    @Autowired
    private SkillAssignmentRepository skillAssignmentRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SkillRepository skillRepository;

    public SkillAssignment assignSkills(Long employeeId , Long skillId , LocalDateTime dateAndTime){

        EmployeeEntity employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee Not Found"));

        SkillEntity skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill Not Found"));

        SkillAssignment skillAssignment = new SkillAssignment();
        skillAssignment.setEmployee(employee);
        skillAssignment.setSkill(skill);
        skillAssignment.setStartDate(LocalDateTime.now());
        skillAssignment.setDeadline(dateAndTime);
        skillAssignment.setStatus("Assigned");

        SkillAssignment saved = skillAssignmentRepository.save(skillAssignment);

        notificationService.createNotification(
                employeeId,
                "New skill assigned: " + skill.getSkillName()
        );

        return saved;

    }

    public List<SkillAssignment> getAssignmentsByEmployee(Long employeeId) {
        return skillAssignmentRepository.findByEmployeeId(employeeId);
    }

}
