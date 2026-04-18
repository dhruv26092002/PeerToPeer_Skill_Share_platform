package com.p2p.exchange.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Professional Email Service for P2P.EXCHANGE.
 * This service handles dynamic email dispatching for all network nodes.
 */
@Service
public class EmailService {

    // This is the "Postman" provided by the spring-boot-starter-mail dependency
    @Autowired
    private JavaMailSender mailSender;

    /**
     * Sends a real, dynamic password recovery email to any user.
     * @param toEmail   The recipient's email address (dynamic from React).
     * @param resetLink The unique link containing the secure UUID token.
     */
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();

            // 1. The 'From' address must match your 'spring.mail.username' in application.properties
            message.setFrom("p2p.exchangeresource@gmail.com");

            // 2. The 'To' address is dynamic, allowing this to work for every user
            message.setTo(toEmail);

            // 3. Setting a professional subject line
            message.setSubject("P2P.EXCHANGE | Secure Access Recovery");

            // 4. The dynamic body containing the unique link
            message.setText("Hello Node,\n\n" +
                    "A password reset was requested for your P2P.EXCHANGE account.\n" +
                    "Click the link below to authorize your new credentials and regain access to the network:\n\n" +
                    resetLink + "\n\n" +
                    "For security reasons, this link will expire shortly. If you did not request this, please ignore this email.\n\n" +
                    "System Admin | P2P.EXCHANGE");

            // 5. The actual dispatch to the Google SMTP servers
            mailSender.send(message);

            System.out.println("LOG: Recovery email successfully dispatched to " + toEmail);

        } catch (Exception e) {
            // Logs detailed errors if the App Password or connection fails
            System.err.println("ERROR: Failed to send email to " + toEmail + ". Reason: " + e.getMessage());
        }
    }
}