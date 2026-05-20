package com.LearnTrack.skilltrack_backend.controller;


import com.LearnTrack.skilltrack_backend.dto.EmployeeDetailsDTO;
import com.LearnTrack.skilltrack_backend.dto.EmployeeOverviewDto;
import com.LearnTrack.skilltrack_backend.dto.InviteRequest;
//import com.LearnTrack.skilltrack_backend.dto.RegistereRequest;
import com.LearnTrack.skilltrack_backend.entity.*;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.EmployeeSkillRepository;
import com.LearnTrack.skilltrack_backend.repository.InviteResitory;
import com.LearnTrack.skilltrack_backend.repository.SkillAssignmentRepository;
import com.LearnTrack.skilltrack_backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private static final Set<String> ALLOWED_ROLES = Set.of(
            "ADMIN",
            "MANAGER",
            "TEAM_LEAD",
            "EMPLOYEE"
    );

    @Autowired
    private SkillAssignmentSerivices skillAssignmentSerivices;

    @Autowired
    private AdminServices adminServices;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private SkillService skillService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeServices employeeServices;

    @Autowired
    private EmailService emailService;

    @Autowired
    private InviteResitory inviteResitory;

    @Autowired
    private SkillAssignmentRepository skillAssignmentRepository;

    @PostMapping("/login")
    public EmployeeEntity login(@RequestBody EmployeeEntity request){
        return adminServices.login(request.getEmail(),request.getPassword());
    }

    @GetMapping("employees")
    public List<EmployeeEntity> getEmployees(){
        return employeeServices.getEmployees();
    }

    @GetMapping("/employees/count")
    public long totalEmployees() {
        return employeeServices.getTotalEmployee();
    }


    @GetMapping("/skills/count")
    public long totalSkills() {
        return employeeSkillRepository.count();
    }

    @GetMapping("/skill-catalog")
    public List<SkillEntity> getSkillCatalog() {
        return skillService.getSkill();
    }

    @PostMapping("/skill-catalog")
    public SkillEntity addSkillCatalog(@RequestBody SkillEntity skill) {
        return skillService.addCatalogSkill(skill);
    }

    @PutMapping("/skill-catalog/{id}")
    public SkillEntity updateSkillCatalog(@PathVariable Long id, @RequestBody SkillEntity skill) {
        return skillService.updateCatalogSkill(id, skill);
    }

    @DeleteMapping("/skill-catalog/{id}")
    public void deleteSkillCatalog(@PathVariable Long id) {
        skillService.deleteCatalogSkill(id);
    }

    @GetMapping("/skills/completed/count")
    public long completedSkills() {
        return employeeSkillRepository.findByStatus("COMPLETED").size();
    }

    @GetMapping("/skills/in-progress/count")
    public long inProgressSkills() {
        return employeeSkillRepository.findByStatus("IN_PROGRESS").size();
    }

    // All skills (for charts)
    @GetMapping("/skills")
    public List<EmployeeSkillEntity> allSkills() {
        return employeeSkillRepository.findAll();
    }

    @DeleteMapping("employees/{id}")
    public void deleteEmployee(@PathVariable Long id){
        adminServices.deleteEmployee(id);
    }

    @GetMapping("/employees/overview")
    public List<EmployeeOverviewDto> getOverview() {
        return employeeServices.getEmployeesOverview();
    }

    @GetMapping("/employee/{id}")
    public EmployeeDetailsDTO getEmployeeDetail(@PathVariable Long id) {
        return employeeServices.getEmployeeDetails(id);
    }

    @GetMapping("/analytics/skills")
    public Map<String, Long> getSkillDistribution() {

        List<SkillAssignment> assignments = skillAssignmentRepository.findAll();

        return assignments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getSkill().getSkillName(),
                        Collectors.counting()
                ));
    }

    @GetMapping("/analytics/categories")
    public Map<String, Long> getCategoryStats() {

        List<SkillAssignment> assignments = skillAssignmentRepository.findAll();

        return assignments.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getSkill().getCategory(),
                        Collectors.counting()
                ));
    }

    @GetMapping("/analytics/progress")
    public Map<String,Long> getProgress(){

        List<SkillAssignment> skills = skillAssignmentRepository.findAll();
        return skills.stream().collect(
                Collectors.groupingBy(SkillAssignment:: getStatus,
                Collectors.counting()
                ));
    }


    @PostMapping("/invite")
    public String inviteEmployee(@RequestBody InviteRequest request) {

        String email = request.getEmail();
        String role = request.getRole() == null || request.getRole().isBlank()
                ? "EMPLOYEE"
                : request.getRole().trim().toUpperCase().replace(" ", "_");

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (!ALLOWED_ROLES.contains(role)) {
            throw new RuntimeException("Invalid role selected");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Name is required");
        }

        if (request.getMobileNumber() == null || request.getMobileNumber().isBlank()) {
            throw new RuntimeException("Mobile number is required");
        }

        if (request.getDesignation() == null || request.getDesignation().isBlank()) {
            throw new RuntimeException("Designation is required");
        }

        if (request.getDepartment() == null || request.getDepartment().isBlank()) {
            throw new RuntimeException("Department is required");
        }

        Long supervisorId = request.getSupervisorId();
        EmployeeEntity supervisor = null;

//        if ("EMPLOYEE".equals(role)) {
//            if (supervisorId == null) {
//                throw new RuntimeException("Team Lead is required for employee");
//            }
//            supervisor = employeeRepository.findById(supervisorId)
//                    .orElseThrow(() -> new RuntimeException("Team Lead not found"));
//            if (!"TEAM_LEAD".equalsIgnoreCase(supervisor.getRole())) {
//                throw new RuntimeException("Employee must report to a Team Lead");
//            }
//        }
//
//        if ("TEAM_LEAD".equals(role)) {
//            if (supervisorId == null) {
//                throw new RuntimeException("Manager is required for team lead");
//            }
//            supervisor = employeeRepository.findById(supervisorId)
//                    .orElseThrow(() -> new RuntimeException("Manager not found"));
//            if (!"MANAGER".equalsIgnoreCase(supervisor.getRole())) {
//                throw new RuntimeException("Team Lead must report to a Manager");
//            }
//        }

        String token = UUID.randomUUID().toString();

        EmployeeInvite invite = new EmployeeInvite();
        invite.setCreatedAt(LocalDateTime.now());
        invite.setExpiryAt(LocalDateTime.now().plusHours(24));
        invite.setEmail(email.trim());
        invite.setName(request.getName().trim());
        invite.setMobileNumber(request.getMobileNumber().trim());
        invite.setDesignation(request.getDesignation().trim());
        invite.setRole(role);
        invite.setDepartment(request.getDepartment().trim());
        invite.setSupervisorId(supervisor != null ? supervisor.getId() : null);
        invite.setToken(token);
        invite.setUsed(false);

        inviteResitory.save(invite);

        String link = "http://localhost:5173/register?token=" + token;

        // 🔥 SEND EMAIL
        emailService.sendInvite(email, link);

        return "Invite sent successfully";
    }


    @PostMapping("/invite/resend/{id}")
    public String resendInvite(@PathVariable Long id) {

        EmployeeInvite invite = inviteResitory.findById(id)
                .orElseThrow(() -> new RuntimeException("Invite not found"));

        String link = "http://localhost:5173/register?token=" + invite.getToken();

        emailService.sendInvite(invite.getEmail(), link);

        return "Invite resent";
    }

    @GetMapping("/invites")
    public List<EmployeeInvite> getAllInvites() {
        return inviteResitory.findAll();
    }

    @DeleteMapping("/invite/{id}")
    public String deleteInvite(@PathVariable Long id) {
        inviteResitory.deleteById(id);
        return "Deleted successfully";
    }

    @GetMapping("/progress/top-performers")
    public List<Map<String, Object>> getTopPerformers() {

        List<EmployeeEntity> employees = employeeRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();

        for (EmployeeEntity emp : employees) {

            List<SkillAssignment> assignments =
                    skillAssignmentSerivices.getAssignmentsByEmployee(emp.getId());

            if (assignments == null || assignments.isEmpty()) continue;

            int avgProgress = assignments.stream()
                    .mapToInt(SkillAssignment::getProgress)
                    .sum() / assignments.size();

            long completed = assignments.stream()
                    .filter(a -> a.getProgress() == 100)
                    .count();

            Map<String, Object> data = new HashMap<>();
            data.put("employeeId", emp.getId());
            data.put("name", emp.getName());
            data.put("progress", avgProgress);
            data.put("completed", completed);

            result.add(data);
        }

        // 🔥 sort by progress DESC
        result.sort((a, b) ->
                Integer.compare((int) b.get("progress"), (int) a.get("progress"))
        );

        return result;
    }

    @GetMapping("reports/employee/{id}")
    public ResponseEntity<InputStreamResource> downloadSingleEmployeeReport(@PathVariable Long id) {

        EmployeeEntity employee = employeeServices.getEmployeeById(id);

        List<EmployeeEntity> list = List.of(employee);

        ByteArrayInputStream excelFile = adminServices.generateEmployeeReport(list);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=employee_" + id + "_report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(excelFile));
    }

    @GetMapping("/reports/employees")
    public ResponseEntity<InputStreamResource> downloadAllEmployeesReport() {

        List<EmployeeEntity> employees = employeeServices.getEmployees();

        ByteArrayInputStream excelFile = adminServices.generateEmployeeReport(employees);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition",
                "attachment; filename=all_employees_report_" + System.currentTimeMillis() + ".xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(new InputStreamResource(excelFile));
    }

    @PostMapping("/assign-skills")
    public SkillAssignment assignSkills(
        @RequestParam Long employeeId,
        @RequestParam Long skillId,
        @RequestParam String deadline
    )
    {
        return skillAssignmentSerivices.assignSkills(
                employeeId,
                skillId,
                LocalDateTime.parse(deadline)
        );
    }

    @GetMapping("/certificates")
    public List<SkillAssignment> getAllCertificates() {
        return skillAssignmentRepository.findAll()
                .stream()
                .filter(a -> Boolean.TRUE.equals(a.getCertificateUploaded()))
                .toList();
    }

    @PutMapping("/certificates/approve/{id}")
    public String approveCertificate(@PathVariable Long id) {

        SkillAssignment assignment = skillAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setCertificateVerified(true);
        assignment.setStatus("VERIFIED");

        skillAssignmentRepository.save(assignment);

        return "Certificate Approved ✅";
    }

    @PutMapping("/certificates/reject/{id}")
    public String rejectCertificate(@PathVariable Long id) {

        SkillAssignment assignment = skillAssignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setCertificateVerified(false);
        assignment.setCertificateUploaded(false);
        assignment.setStatus("REJECTED");

        skillAssignmentRepository.save(assignment);

        return "Certificate Rejected ❌";
    }

    @PutMapping("/assign-test/{id}")
    public SkillAssignment assignTest(@PathVariable Long id, @RequestBody Map<String, String> req) {

        SkillAssignment a = skillAssignmentRepository.findById(id).orElseThrow();

        a.setTestLink(req.get("testLink"));

        // 🔥 Reset for reattempt
        a.setResultLink(null);
        a.setTestScore(null);
        a.setAdminApproved(false);
        a.setRejectReason(null);

        a.setTestStatus("ASSIGNED");

        return skillAssignmentRepository.save(a);
    }

    @PutMapping("/verify-test/{id}")
    public SkillAssignment verifyTest(
            @PathVariable Long id,
            @RequestParam boolean approved
    ) {
        SkillAssignment a = skillAssignmentRepository.findById(id).orElseThrow();

        a.setAdminApproved(approved);

        if (approved) {
            a.setTestStatus("VERIFIED");
        } else {
            a.setTestStatus("REJECTED");
        }

        return skillAssignmentRepository.save(a);
    }


}
