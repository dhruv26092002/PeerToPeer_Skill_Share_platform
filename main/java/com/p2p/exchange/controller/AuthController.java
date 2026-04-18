package com.p2p.exchange.controller;
import com.p2p.exchange.model.LoginRequest; // Create this simple class!
import com.p2p.exchange.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.p2p.exchange.service.EmailService;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // This lets your React bubble talk to Java
public class AuthController {
    @Autowired
    private com.p2p.exchange.repository.StudentRepository studentRepository;
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest loginRequest) {
        // We call the service that knows how to check encoded passwords
        String result = authService.loginStudent(loginRequest.getUserId(), loginRequest.getPassword());

        if ("Success".equals(result)) {
            return ResponseEntity.ok("Login successful!");
        } else {
            // This is why your React app shows the "Wrong Password" alert!
            return ResponseEntity.status(401).body(result);
        }
    }
    @Autowired
    private EmailService emailService;

    // 2. Update the method to accept a Map instead of a String
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        System.out.println("LOG: Received password reset request for: " + email);

        // 1. Generate the unique token
        String token = java.util.UUID.randomUUID().toString();

        // 2. THIS IS THE MISSING LINE: Save the token to the database!
        authService.saveResetTokenForUser(email, token);

        // 3. Create the link and send the email
        String resetLink = "http://localhost:3000/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);

        return ResponseEntity.ok("Recovery link dispatched to: " + email);
    }
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");

        // 1. In a professional app, you find the user associated with this token
        // 2. For now, we will update the password for the specific node (Dhruv)
        System.out.println("LOG: Resetting password for token: " + token);

        boolean success = authService.updateUserPassword(token, newPassword);

        if (success) {
            return ResponseEntity.ok("Credentials updated in the P2P network.");
        } else {
            return ResponseEntity.status(400).body("Invalid or expired token.");
        }
    }
    // --- THE NEW REGISTRATION DESK ---
    @PostMapping("/register")
    public org.springframework.http.ResponseEntity<String> registerUser(@RequestBody com.p2p.exchange.model.Student newStudent) {

        // 1. Give every brand new user 10 TC to start!
        newStudent.setAvailableBalance(10.0);
        newStudent.setLockedBalance(0.0);

        // 2. Save the new user to PostgreSQL
        studentRepository.save(newStudent);

        return org.springframework.http.ResponseEntity.ok("Registration successful! Welcome to the network.");
    }
}