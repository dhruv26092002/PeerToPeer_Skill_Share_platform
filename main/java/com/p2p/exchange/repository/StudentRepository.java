package com.p2p.exchange.repository;

import com.p2p.exchange.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// This "Interface" is like a remote control for your Database Table
public interface StudentRepository extends JpaRepository<Student, Long> {

    // These are the buttons on the remote control:
    Optional<Student> findByUserId(String userId);

    Boolean existsByUserId(String userId);

    Boolean existsByEmail(String email);
    Student findByEmail(String email);
    Student findByResetToken(String resetToken);
}