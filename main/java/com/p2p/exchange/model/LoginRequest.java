package com.p2p.exchange.model;

public class LoginRequest {
    private String userId;
    private String password;

    // Standard Getters and Setters (Important!)
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}