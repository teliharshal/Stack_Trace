package com.LearnTrack.skilltrack_backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.File;


@Service
public class EmailService {
        @Autowired
        private JavaMailSender mailSender;

    public void sendHtmlMail(String to, String subject, String htmlContent) {

        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(to);
            helper.setSubject(subject);

            // HTML content
            helper.setText(htmlContent, true);

            // Attach logo from local
            ClassPathResource resource = new ClassPathResource("static/codevergeLogo.png");
            helper.addInline("logoImage", resource);// 👈 key

            mailSender.send(message);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Email failed");
        }
    }

    public void sendInvite(String toEmail, String link) {

        String subject = "Activate Your Codeverge Skilltrack Account";

        String htmlContent = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f6f8;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            }
            .header {
                background-color: #0f172a;
                color: white;
                padding: 15px;
                display: flex;
                align-items: center;
                justify-content:center;
            }
            .header img {
                height: 40px;
                margin-right: 10px;
            }
            .content {
                padding: 20px;
                color: #333;
            }
            .btn {
                display: inline-block;
                padding: 12px 20px;
                background-color: #3b82f6;
                color:#ffffff !important;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin-top: 15px;
                font-weight: bold;
            }
            .section {
                margin-top: 20px;
            }
            .footer {
                text-align: center;
                font-size: 12px;
                color: #888;
                padding: 15px;
                border-top: 1px solid #eee;
            }
            ul {
                padding-left: 18px;
            }
        </style>
    </head>
    <body>

        <div class="container">

            <!-- Header -->
            <div class="header">
                <h2>Stacktrace</h2>
            </div>

            <!-- Content -->
            <div class="content">
                <h2>🔐 Activate Your Account</h2>

                <p>
                    Welcome to StackTrace ! Your account has been created.
                    Please activate your account and set your password to get started.
                </p>

                <!-- Button -->
                <a href="%s" class="btn">Activate Account & Set Password</a>

                <!-- Security Info -->
                <div class="section">
                    <h3>🔐 Security Information:</h3>
                    <ul>
                        <li>This activation link is valid for 24 hours</li>
                        <li>You will be asked to create a secure password</li>
                        <li>Password must be at least 8 characters long</li>
                        <li>Include uppercase, lowercase, numbers, and special characters</li>
                    </ul>
                </div>

                <!-- After Activation -->
                <div class="section">
                    <h3>📋 After Activation:</h3>
                    <ul>
                        <li>Add skills to your personal tracker</li>
                        <li>Select your learning roadmap to get started</li>
                        <li>Define your learning goals and timelines</li>
                        <li>Monitor your progress and consistency</li>
                        <li>Stay consistent to build strong learning habits</li>
                    </ul>
                </div>

                <!-- Important -->
                <div class="section">
                    <h3>⚠️ Important:</h3>
                    <p>
                        If you did not request this account, please contact HR immediately.
                    </p>
                </div>

                <!-- Help -->
                <div class="section">
                    <h3>📞 Need Help?</h3>
                    <ul>
                        <li>Email: hr@codevergeit.com</li>
                        <li>Phone: +91-800-StaceTrace-HELP</li>
                    </ul>
                </div>

            </div>

            <!-- Footer -->
            <div class="footer">
                © 2026 stacktrace<br/>
                This is an automated message. Please do not reply.
            </div>
        </div>
    </body>
    </html>
    """.formatted(link);

        sendHtmlMail(toEmail, subject, htmlContent);
    }

}
