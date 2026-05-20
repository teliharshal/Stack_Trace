package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.dto.EmployeeDetailsDTO;
import com.LearnTrack.skilltrack_backend.dto.EmployeeOverviewDto;
import com.LearnTrack.skilltrack_backend.dto.SkillDto;
import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.EmployeeSkillEntity;
import com.LearnTrack.skilltrack_backend.entity.SkillAssignment;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.EmployeeSkillRepository;
import com.LearnTrack.skilltrack_backend.repository.SkillAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class EmployeeServices {
    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private SkillAssignmentRepository skillAssignmentRepository;

    public EmployeeEntity addEmployee(EmployeeEntity employee) {
        return employeeRepository.save(employee);
    }

    public EmployeeEntity updateAvatar(Long id, String avatarUrl) {
        EmployeeEntity employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (isAdmin(employee)) {
            throw new RuntimeException("Admin account cannot be updated");
        }

        employee.setAvatarUrl((avatarUrl == null || avatarUrl.isBlank()) ? null : avatarUrl);
        return employeeRepository.save(employee);
    }

    public List<EmployeeEntity> getEmployees() {
        return employeeRepository.findAll().stream()
                .filter(emp -> !isAdmin(emp))
                .toList();
    }

//    public void deleteEmployee(Long id) {
//        EmployeeEntity employee = employeeRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Employee not found"));
//
//        if (isAdmin(employee)) {
//            throw new RuntimeException("Admin account cannot be deleted");
//        }
//
//        employeeRepository.deleteById(id);
//    }

    public long getTotalEmployee() {
        return employeeRepository.findAll().stream()
                .filter(emp -> !isAdmin(emp))
                .count();
    }

    public EmployeeEntity getEmployeeById(Long id) {
        EmployeeEntity employee = employeeRepository.findById(id).orElseThrow();

        if (isAdmin(employee)) {
            throw new RuntimeException("Employee not found");
        }

        return employee;
    }

    public List<EmployeeOverviewDto> getEmployeesOverview() {

        List<EmployeeEntity> employees = employeeRepository.findAll();

        return employees.stream().map(emp -> {

            List<SkillAssignment> assignments =
                    skillAssignmentRepository.findByEmployeeId(emp.getId());

            int total = assignments.size();

            int completed = (int) assignments.stream()
                    .filter(a -> a.getProgress() == 100)
                    .count();

            int inProgress = (int) assignments.stream()
                    .filter(a -> a.getProgress() > 0 && a.getProgress() < 100)
                    .count();

            List<String> currentSkills = assignments.stream()
                    .filter(a -> a.getProgress() < 100)
                    .map(a -> a.getSkill().getSkillName())
                    .toList();

            EmployeeOverviewDto dto = new EmployeeOverviewDto();

            dto.setEmployeeId(emp.getId());
            dto.setName(emp.getName());
            dto.setEmail(emp.getEmail());
            dto.setRole(emp.getRole());

            dto.setTotalSkills(total);
            dto.setCompleted(completed);
            dto.setInProgress(inProgress);
            dto.setCurrentSkills(currentSkills);

            return dto;

        }).toList();
    }

    public List<EmployeeOverviewDto> getDirectReports(Long employeeId) {
        return employeeRepository.findByReportsTo_Id(employeeId).stream()
                .filter(emp -> !isAdmin(emp))
                .map(this::buildOverviewDto)
                .toList();
    }

    public List<EmployeeOverviewDto> getDirectReportsByEmail(String email) {
        EmployeeEntity employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        return getDirectReports(employee.getId());
    }

    public List<EmployeeOverviewDto> getAvailableSupervisors(String role) {
        String normalizedRole = role == null ? "" : role.trim().toUpperCase().replace(" ", "_");
        String requiredSupervisorRole = switch (normalizedRole) {
            case "EMPLOYEE" -> "TEAM_LEAD";
            case "TEAM_LEAD" -> "MANAGER";
            default -> null;
        };

        if (requiredSupervisorRole == null) {
            return List.of();
        }

        return employeeRepository.findAll().stream()
                .filter(emp -> requiredSupervisorRole.equalsIgnoreCase(emp.getRole()))
                .map(this::buildOverviewDto)
                .toList();
    }

    private EmployeeOverviewDto buildOverviewDto(EmployeeEntity emp) {
        List<EmployeeSkillEntity> skills = employeeSkillRepository.findByEmployeeId(emp.getId());

        int total = skills.size();
        int completed = (int) skills.stream()
                .filter(s -> "COMPLETED".equalsIgnoreCase(s.getStatus()))
                .count();
        int inProgress = (int) skills.stream()
                .filter(s -> "IN_PROGRESS".equalsIgnoreCase(s.getStatus()))
                .count();
        List<String> currentSkills = skills.stream()
                .filter(s -> "IN_PROGRESS".equalsIgnoreCase(s.getStatus()))
                .map(EmployeeSkillEntity::getSkillName)
                .toList();

        EmployeeOverviewDto dto = new EmployeeOverviewDto();
        dto.setEmployeeId(emp.getId());
        dto.setName(emp.getName());
        dto.setEmail(emp.getEmail());
        dto.setAvatarUrl(emp.getAvatarUrl());
        dto.setDesignation(emp.getDesignation());
        dto.setRole(emp.getRole());
        dto.setDepartment(emp.getDepartment());
        dto.setMobileNumber(emp.getMobileNumber());
        dto.setReportsToId(emp.getReportsToId());
        dto.setReportsToName(emp.getReportsToName());
        dto.setTotalSkills(total);
        dto.setCompleted(completed);
        dto.setInProgress(inProgress);
        dto.setCurrentSkills(currentSkills);

        return dto;
    }

    public EmployeeDetailsDTO getEmployeeDetails(Long id) {

        EmployeeEntity emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        List<SkillAssignment> assignments =
                skillAssignmentRepository.findByEmployeeId(id);

        int total = assignments.size();

        // ✅ COMPLETED = TEST VERIFIED
        int completed = (int) assignments.stream()
                .filter(a -> "VERIFIED".equalsIgnoreCase(a.getTestStatus()))
                .count();

        // ✅ IN PROGRESS = NOT VERIFIED
        int inProgress = (int) assignments.stream()
                .filter(a -> !"VERIFIED".equalsIgnoreCase(a.getTestStatus()))
                .count();

        // ================= IN PROGRESS =================
        List<SkillDto> inProgressSkills = assignments.stream()
                .filter(a -> a.getProgress() < 100)
                .map(a -> {
                    SkillDto dto = new SkillDto();

                    dto.setId(a.getId());
                    dto.setSkillName(a.getSkill().getSkillName());
                    dto.setProgressPercentage(a.getProgress());

                    dto.setCertificateUrl(null);
                    dto.setCertificateUploaded(false);
                    dto.setCertificateVerified(false);

                    dto.setTestLink(a.getTestLink());
                    dto.setResultLink(a.getResultLink());
                    dto.setTestScore(a.getTestScore());
                    dto.setAdminApproved(a.getAdminApproved());
                    dto.setTestStatus(a.getTestStatus());
                    dto.setRejectReason(a.getRejectReason());

                    return dto;
                })
                .toList();

// ================= COMPLETED =================
        List<SkillDto> completedSkills = assignments.stream()
                .filter(a -> a.getProgress() == 100)
                .map(a -> new SkillDto(
                        a.getId(),
                        a.getSkill().getSkillName(),
                        a.getProgress(),

                        a.getCertificateUrl(),
                        a.getCertificateUploaded(),
                        a.getCertificateVerified(),

                        a.getTestLink(),
                        a.getResultLink(),
                        a.getTestScore(),
                        a.getAdminApproved(),
                        a.getTestStatus(),
                        a.getRejectReason()
                ))
                .toList();

        // ================= DTO =================
        EmployeeDetailsDTO dto = new EmployeeDetailsDTO();

        dto.setName(emp.getName());
        dto.setEmail(emp.getEmail());
        dto.setRole(emp.getRole());

        dto.setTotalSkills(total);
        dto.setCompleted(completed);
        dto.setInProgress(inProgress);

        dto.setInProgressSkills(inProgressSkills);
        dto.setCompletedSkills(completedSkills);

        return dto;
    }

    public String uploadAvatarFile(MultipartFile file) {
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path uploadPath = Paths.get(System.getProperty("user.dir"), "uploads");

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(fileName);

            Files.write(filePath, file.getBytes());

            return "/uploads/" + fileName;

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload file");
        }
    }

    private boolean isAdmin(EmployeeEntity employee) {
        return employee != null && "ADMIN".equalsIgnoreCase(employee.getRole());
    }

    public String uploadCertificate(Long assignmentId, MultipartFile file) {

        try {
            SkillAssignment assignment = skillAssignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new RuntimeException("Assignment not found"));

            // 🔒 Only allow if skill completed
            if (assignment.getProgress() < 100) {
                throw new RuntimeException("Complete the skill before uploading certificate");
            }

            String uploadDir = System.getProperty("user.dir") + "/uploads/certificates/";

            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();

            Path filePath = Paths.get(uploadDir + fileName);
            Files.write(filePath, file.getBytes());

            // ✅ Save in DB
            assignment.setCertificateUrl("/uploads/certificates/" + fileName);
            assignment.setCertificateUploaded(true);

            skillAssignmentRepository.save(assignment);

            return "Certificate uploaded successfully";

        } catch (Exception e) {
            throw new RuntimeException("Upload failed", e);
        }
    }

}
