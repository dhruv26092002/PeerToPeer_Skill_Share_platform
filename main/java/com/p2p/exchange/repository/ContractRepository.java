package com.p2p.exchange.repository;

import com.p2p.exchange.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    // Finds requests where you are the Mentor and the status is still LOCKED/PENDING
    List<Contract> findByMentor_UserIdAndStatus(String mentorUserId, String status);

    // Finds all active learning sessions for you
    List<Contract> findByLearner_UserId(String learnerUserId);
}