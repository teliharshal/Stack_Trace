package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.entity.EmployeeSkillEntity;
import com.LearnTrack.skilltrack_backend.repository.EmployeeSkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class EmployeeSkillServices {
    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

//    public List<EmployeeSkillEntity> getInProgressStatus(){
//        return employeeSkillRepository.findByStatus("In Progress");
//    }
//
//   public List<EmployeeSkillEntity> getCompletedStatus(){
//        return employeeSkillRepository.findByStatus("Completed");
//    }
//
//    public Long getRemainingDays(Long id){
//        EmployeeSkillEntity skill = employeeSkillRepository.findById(id).orElseThrow();
//                return ChronoUnit.DAYS.between(LocalDate.now(),skill.getEndDate());
//    }

    public List<EmployeeSkillEntity> getEmployeeSkills(Long employeeId) {

        return employeeSkillRepository.findByEmployeeId(employeeId);

    }

}
