package com.example.taskflow.service.imp;

import com.example.taskflow.model.enums.UserRole;
import com.example.taskflow.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendUserCredentials(String email, String password, String fullName, UserRole role) {
        // Always log to console for development
        System.out.println("=== EMAIL SENT (CONSOLE) ===");
        System.out.println("To: " + email);
        System.out.println("Subject: Your TaskFlow Account Credentials");
        System.out.println("Body:");
        System.out.println("Hello " + fullName + ",");
        System.out.println("Your TaskFlow account has been created successfully.");
        System.out.println("Role: " + role);
        System.out.println("Email: " + email);
        System.out.println("Password: " + password);
        System.out.println("Please login at: http://localhost:4200/login");
        System.out.println("==================");

        try {
            // Try to send actual email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your TaskFlow Account Credentials");
            message.setText("Hello " + fullName + ",\n\n" +
                    "Your TaskFlow account has been created successfully.\n" +
                    "Role: " + role + "\n" +
                    "Email: " + email + "\n" +
                    "Password: " + password + "\n\n" +
                    "Please login at: http://localhost:4200/login\n\n" +
                    "Best regards,\nTaskFlow Team");
            
            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + email);
            
        } catch (Exception e) {
            System.out.println("❌ Email sending failed: " + e.getMessage());
            System.out.println("📧 Credentials are logged above for development purposes.");
            System.out.println("💡 To enable email sending:");
            System.out.println("   1. Set up Gmail App Password");
            System.out.println("   2. Update application.properties with the password");
            System.out.println("   3. Or use Ethereal Email for testing");
        }
    }

    @Override
    public void sendPasswordReset(String email, String resetToken) {
        System.out.println("Password reset email would be sent to: " + email);
        System.out.println("Reset token: " + resetToken);
    }

    @Override
    public void sendTaskNotification(String email, String taskTitle, String message) {
        System.out.println("Task notification would be sent to: " + email);
        System.out.println("Task: " + taskTitle);
        System.out.println("Message: " + message);
    }
} 