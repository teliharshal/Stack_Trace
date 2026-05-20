package com.LearnTrack.skilltrack_backend.controller;

//import com.LearnTrack.skilltrack_backend.dto.LoginRequest;
//import com.LearnTrack.skilltrack_backend.dto.LoginResponse;
import com.LearnTrack.skilltrack_backend.dto.RegistereRequest;
import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.entity.EmployeeInvite;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import com.LearnTrack.skilltrack_backend.repository.InviteResitory;
import com.LearnTrack.skilltrack_backend.service.AuthServices;
import com.LearnTrack.skilltrack_backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthServices authServices;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private InviteResitory inviteResitory;


    @PostMapping("/login")
    public EmployeeEntity login(@RequestBody Map<String, String> request) {
        return authServices.login(
                request.get("email"),
                request.get("password")
        );
    }

    @PostMapping("/send-otp")
    public String sendOtp(@RequestBody Map<String, String> request) {

        String email = request.get("email");

        otpService.sendOtp(email);

        return "OTP sent successfully";
    }

    @PostMapping("/register")
    public String register(@RequestBody RegistereRequest req) {

        EmployeeInvite invite = inviteResitory.findByToken(req.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid invite link"));

        if (invite.isUsed()) {
            throw new RuntimeException("Invite already used");
        }

        if (invite.getExpiryAt() != null && invite.getExpiryAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invite link expired");
        }

        if (employeeRepository.existsByEmail(invite.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        if (req.getPassword() == null || req.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        EmployeeEntity emp = new EmployeeEntity();
        emp.setEmail(invite.getEmail());
        emp.setName(invite.getName());
        emp.setMobileNumber(invite.getMobileNumber());
        emp.setDesignation(invite.getDesignation());
        emp.setDepartment(invite.getDepartment());
        if (invite.getSupervisorId() != null) {
            EmployeeEntity supervisor = employeeRepository.findById(invite.getSupervisorId())
                    .orElseThrow(() -> new RuntimeException("Supervisor not found"));
            emp.setReportsTo(supervisor);
        }
        emp.setPassword(req.getPassword());
        emp.setRole(invite.getRole() == null || invite.getRole().isBlank() ? "EMPLOYEE" : invite.getRole());

        employeeRepository.save(emp);

        invite.setUsed(true);
        inviteResitory.save(invite);

        return "Registered successfully";
    }

//    @PostMapping("/forgot-password")
//    public ResponseEntity<?> forgotPassword(@RequestBody Map<String,String> request){
//
//        String email = request.get("email");
//
//        otpService.sendOtp(email);
//
//        return ResponseEntity.ok("OTP sent to email");
//
//    }

//    @PostMapping("/verify-otp")
//    public String verifyOtp(@RequestBody Map<String,String> request){
//        return otpService.verifyOtp(request.get("email"), request.get("otp"));
//    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody Map<String,String> request){
        return otpService.verifyOtp(
                request.get("email"),
                request.get("otp")
        );
    }


    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody Map<String,String> request){
        return otpService.resetPassword(
                request.get("email"),
                request.get("newPassword")
        );
    }

}
