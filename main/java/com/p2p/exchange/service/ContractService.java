package com.p2p.exchange.service;

import com.p2p.exchange.model.Contract;
import com.p2p.exchange.model.Student;
import com.p2p.exchange.repository.ContractRepository;
import com.p2p.exchange.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContractService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Transactional
    public Contract createContract(Long learnerId, Long mentorId, Double amount, Integer sessions, int days) {
        Student learner = studentRepository.findById(learnerId).orElseThrow();
        Student mentor = studentRepository.findById(mentorId).orElseThrow();

        // THE LOCK LOGIC: Move 10 TC from Available to Locked
        if (learner.getAvailableBalance() >= amount) {
            learner.setAvailableBalance(learner.getAvailableBalance() - amount);
            learner.setLockedBalance(learner.getLockedBalance() + amount);

            Contract contract = new Contract();
            contract.setLearner(learner);
            contract.setMentor(mentor);
            contract.setTotalAmount(amount);
            contract.setTotalSessions(sessions);
            contract.setDeadline(LocalDateTime.now().plusDays(days)); // The "Time Window"

            studentRepository.save(learner);
            return contractRepository.save(contract);
        }
        throw new RuntimeException("Insufficient TC Balance");
    }

    @Transactional
    public void verifySessionWithOTP(Long contractId) {
        Contract contract = contractRepository.findById(contractId).orElseThrow();
        Student learner = contract.getLearner();
        Student mentor = contract.getMentor();

        // THE RELEASE LOGIC: Move 2 TC to Mentor's Available pocket
        Double perSessionFee = contract.getTotalAmount() / contract.getTotalSessions();

        learner.setLockedBalance(learner.getLockedBalance() - perSessionFee);
        mentor.setAvailableBalance(mentor.getAvailableBalance() + perSessionFee);

        contract.setCompletedSessions(contract.getCompletedSessions() + 1);
        contract.setLastActivity(LocalDateTime.now()); // Resets the 48h clock

        studentRepository.save(learner);
        studentRepository.save(mentor);
        contractRepository.save(contract);
    }
    // --- NEW: For the Dashboard Approval Cards ---
    public List<Contract> getPendingRequestsForMentor(String mentorUserId) {
        // Change "LOCKED" to whatever default status you use when a contract is first created!
        return contractRepository.findByMentor_UserIdAndStatus(mentorUserId, "LOCKED");
    }
}