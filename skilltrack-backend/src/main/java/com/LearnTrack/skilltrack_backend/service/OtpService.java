package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.entity.EmployeeEntity;
import com.LearnTrack.skilltrack_backend.repository.EmployeeRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private JavaMailSender mailSender;

    // Temporary OTP storage
    private Map<String, String> otpStorage = new HashMap<>();

    public void sendOtp(String email) {
        // 1. Check if employee exists (Fix: Use .isPresent() for Optional)
        Optional<EmployeeEntity> employee = employeeRepository.findByEmail(email);
        if (employee.isEmpty()) {
            throw new RuntimeException("Email not registered");
        }

        // 2. Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpStorage.put(email, otp);

        // 3. Set expiration (Remove OTP from storage after 10 minutes)
        Executors.newSingleThreadScheduledExecutor().schedule(() -> {
            otpStorage.remove(email);
        }, 10, TimeUnit.MINUTES);

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");

            // HTML Content styled like your screenshot
            String htmlMsg = "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;'>"
                    + "<div style='background-color: #0f172a; padding: 20px; text-align: center;'>"
                    + "<h2 style='color: white; margin: 0;'>StackTrace</h2>"
                    + "</div>"
                    + "<div style='padding: 30px; background-color: #ffffff;'>"
                    + "<h3 style='color: #1e293b;'>🔐 Reset Your Password</h3>"
                    + "<p style='color: #64748b;'>Welcome to StackTrace! Use the OTP below to verify your account and reset your password.</p>"
                    + "<div style='text-align: center; margin: 30px 0;'>"
                    + "<span style='background-color: #3b82f6; color: white; padding: 12px 30px; font-size: 24px; font-weight: bold; border-radius: 8px; letter-spacing: 5px; display: inline-block;'>" + otp + "</span>"
                    + "</div>"
                    + "<h4 style='color: #1e293b;'>🔐 Security Information:</h4>"
                    + "<ul style='color: #64748b; font-size: 14px;'>"
                    + "<li>This OTP is valid for <b>10 minutes</b>.</li>"
                    + "<li>Do not share this code with anyone.</li>"
                    + "<li>If you didn't request this, please ignore this email.</li>"
                    + "</ul>"
                    + "<hr style='border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;'>"
                    + "<p style='font-size: 12px; color: #94a3b8; text-align: center;'>© 2026 SkillTrack - All rights reserved.</p>"
                    + "</div>"
                    + "</div>";

            helper.setText(htmlMsg, true); // true indicates HTML
            helper.setTo(email);
            helper.setSubject("StackTrace Password Reset OTP");
            helper.setFrom("your-email@gmail.com");

            mailSender.send(mimeMessage);
        } catch (Exception e) {
            throw new RuntimeException("Error sending email: " + e.getMessage());
        }
    }

    public String verifyOtp(String email, String otp){

        String storedOtp = otpStorage.get(email);

        if(storedOtp == null){
            throw new RuntimeException("OTP not found");
        }

        if(!storedOtp.equals(otp)){
            throw new RuntimeException("Invalid OTP");
        }

        return "OTP verified";
    }

    public String resetPassword(String email, String newPassword){

        EmployeeEntity employee =
                employeeRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("User not found"));

        employee.setPassword(newPassword);

        employeeRepository.save(employee);

        otpStorage.remove(email);

        return "Password reset successful";
    }
}