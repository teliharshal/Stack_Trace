package com.LearnTrack.skilltrack_backend.controller;

import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.EmployeeSkillEntity;
import com.LearnTrack.skilltrack_backend.entity.SkillAssignment;
import com.LearnTrack.skilltrack_backend.repository.SkillAssignmentRepository;
import com.LearnTrack.skilltrack_backend.service.EmployeeServices;
import com.LearnTrack.skilltrack_backend.service.EmployeeSkillServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "api/employee")
public class EmployeeController {

    @Autowired
    private EmployeeServices employeeServices;

    @Autowired
    private SkillAssignmentRepository skillAssignmentRepository;

    @Autowired
    private EmployeeSkillServices employeeSkillServices;

    @PostMapping
    public EmployeeEntity addEmployee(@RequestBody EmployeeEntity employee){
        return employeeServices.addEmployee(employee);
    }

    @GetMapping
    public List<EmployeeEntity> getEmployees(){
        return employeeServices.getEmployees();
    }

    @GetMapping("/{id}")
    public EmployeeEntity getEmployeeById(@PathVariable Long id){
        return employeeServices.getEmployeeById(id);
    }

    @GetMapping("/me/direct-reports")
    public List<com.LearnTrack.skilltrack_backend.dto.EmployeeOverviewDto> getDirectReports(Principal principal) {
        return employeeServices.getDirectReportsByEmail(principal.getName());
    }

    @GetMapping("/supervisors")
    public List<com.LearnTrack.skilltrack_backend.dto.EmployeeOverviewDto> getAvailableSupervisors(@RequestParam String role) {
        return employeeServices.getAvailableSupervisors(role);
    }

    @PutMapping("/{id}/avatar")
    public EmployeeEntity updateAvatar(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String avatarUrl = request.get("avatarUrl"); // ✅ FIX

        return employeeServices.updateAvatar(id, avatarUrl);
    }

//    @DeleteMapping("{id}")
//    public void deleteEmployee(@PathVariable Long id){
//        .deleteEmployee(id);
//    }

    @GetMapping("dashboard/total-employees")
    public long getTotalEmployees(){
        return employeeServices.getTotalEmployee();
    }

    @GetMapping("/assignments/{employeeId}")
    public List<SkillAssignment> getAssignments(@PathVariable Long employeeId){
        return skillAssignmentRepository.findByEmployeeId(employeeId);
    }

    @PostMapping("/upload-avatar")
    public String uploadAvatar(@RequestParam("file") MultipartFile file) {
        return employeeServices.uploadAvatarFile(file);
    }

    @PostMapping("/upload-certificate/{assignmentId}")
    public String uploadCertificate(
            @PathVariable Long assignmentId,
            @RequestParam("file") MultipartFile file
    ) {
        return employeeServices.uploadCertificate(assignmentId, file);
    }

    @PutMapping("/submit-test/{id}")
    public SkillAssignment submitTest(
            @PathVariable Long id,
            @RequestBody Map<String, Object> req
    ) {
        SkillAssignment a = skillAssignmentRepository.findById(id).orElseThrow();

        a.setResultLink(req.get("resultLink").toString());
        a.setTestScore(Double.valueOf(req.get("score").toString()));
        a.setTestStatus("SUBMITTED");

        return skillAssignmentRepository.save(a);
    }

    @GetMapping("/assignment/{id}")
    public ResponseEntity<SkillAssignment> getAssignment(@PathVariable Long id) {

        SkillAssignment assignment = skillAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        return ResponseEntity.ok(assignment);
    }

//    @GetMapping("/skills/{employeeId}")
//    public List<EmployeeSkillEntity> getSkills(@PathVariable Long employeeId){
//
//        return employeeSkillServices.getEmployeeSkills(employeeId);
//
//    }

}
