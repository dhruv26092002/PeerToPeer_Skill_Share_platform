package com.p2p.exchange.controller;

import com.p2p.exchange.model.Contract;
import com.p2p.exchange.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
@CrossOrigin(origins = "http://localhost:3000") // Connects to your React app
public class ContractController {

    @Autowired
    private ContractService contractService;

    @PostMapping("/authorize")
    public Contract authorizeContract(@RequestParam Long learnerId, @RequestParam Long mentorId,
                                      @RequestParam Double amount, @RequestParam Integer sessions,
                                      @RequestParam int days) {
        return contractService.createContract(learnerId, mentorId, amount, sessions, days);
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestParam Long contractId) {
        contractService.verifySessionWithOTP(contractId);
        return "Session Verified. Tokens Released!";
    }
    // --- NEW: React Dashboard will call this to get the Approval Cards! ---
    @GetMapping("/pending/{userId}")
    public org.springframework.http.ResponseEntity<java.util.List<Contract>> getPendingApprovals(@PathVariable String userId) {
        // Make sure you also added the 'getPendingRequestsForMentor' to your ContractService!
        java.util.List<Contract> pending = contractService.getPendingRequestsForMentor(userId);
        return org.springframework.http.ResponseEntity.ok(pending);
    }
}