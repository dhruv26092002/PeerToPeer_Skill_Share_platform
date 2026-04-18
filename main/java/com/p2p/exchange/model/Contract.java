package com.p2p.exchange.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double totalAmount;
    private Integer totalSessions;
    private Integer completedSessions = 0;
    private LocalDateTime deadline;
    private LocalDateTime lastActivity;
    private String status = "LOCKED";

    @ManyToOne
    private Student mentor;

    @ManyToOne
    private Student learner;

    // --- GENERATED GETTERS & SETTERS (The "Doors") ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public Integer getTotalSessions() { return totalSessions; }
    public void setTotalSessions(Integer totalSessions) { this.totalSessions = totalSessions; }

    public Integer getCompletedSessions() { return completedSessions; }
    public void setCompletedSessions(Integer completedSessions) { this.completedSessions = completedSessions; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public LocalDateTime getLastActivity() { return lastActivity; }
    public void setLastActivity(LocalDateTime lastActivity) { this.lastActivity = lastActivity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Student getMentor() { return mentor; }
    public void setMentor(Student mentor) { this.mentor = mentor; }

    public Student getLearner() { return learner; }
    public void setLearner(Student learner) { this.learner = learner; }
}