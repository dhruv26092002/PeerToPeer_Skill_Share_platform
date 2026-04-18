package com.p2p.exchange.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity // This tells the database: "Make a table for this!"
@Table(name = "students")
@Data // This saves us from writing extra code for Getters and Setters
public class Student {
    private Double availableBalance = 10.0; // Everyone starts with 10 TC
    private Double lockedBalance = 0.0;    // Starts at zero until a deal is made
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // This is the unique serial number (1, 2, 3...)
    private String resetToken;

    // Add the getter and setter for it
    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    @Column(unique = true, nullable = false)
    private String userId; // This is the unique name they pick (e.g., @dhruv_123)

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private Double credits = 10.0; // Every new student gets 10 free points!
    @Column(columnDefinition = "TEXT")
    private String profilePicture;

    // Add Getter and Setter
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}