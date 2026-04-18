package com.p2p.exchange.service;

import com.p2p.exchange.model.Student;
import com.p2p.exchange.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private StudentRepository studentRepository;

    // --- 1. LOGIN LOGIC ---
    public String loginStudent(String userId, String rawPassword) {
        return studentRepository.findByUserId(userId)
                .map(student -> {
                    // Compares the password in the DB with the one typed in React
                    if (student.getPassword().equals(rawPassword)) {
                        return "Success";
                    } else {
                        return "Invalid Password";
                    }
                })
                .orElse("User not found");
    }

    // --- 2. REGISTRATION LOGIC ---
    public Student registerStudent(Student student) {
        // Saves the brand new user (including their email) to PostgreSQL
        return studentRepository.save(student);
    }

    // --- 3. SAVE RECOVERY TOKEN (FORGOT PASSWORD) ---
    public void saveResetTokenForUser(String email, String token) {
        // Find the user by the email they entered in the forgot password bubble
        Student student = studentRepository.findByEmail(email);
        if (student != null) {
            student.setResetToken(token); // Attach the secret token to their account
            studentRepository.save(student); // Save it to the database
            System.out.println("LOG: Recovery token saved for user: " + student.getUserId());
        } else {
            System.out.println("LOG: No user found with email: " + email);
        }
    }

    // --- 4. UPDATE PASSWORD (RESET PASSWORD LINK) ---
    public boolean updateUserPassword(String token, String newPassword) {
        System.out.println("LOG: Searching DB for token: " + token);

        // Find the specific user who holds this exact token
        Student student = studentRepository.findByResetToken(token);

        if (student != null) {
            student.setPassword(newPassword); // Overwrite the old password
            student.setResetToken(null);      // Clear the token so it cannot be reused!
            studentRepository.save(student);  // Save the new credentials to PostgreSQL
            System.out.println("LOG: Password successfully updated for: " + student.getUserId());
            return true;
        }

        System.out.println("LOG: Token was invalid or expired.");
        return false;
    }
}