package com.p2p.exchange.repository;

import com.p2p.exchange.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    // This button on our remote lets us see everything one specific student has listed
    List<Resource> findByOwnerId(Long ownerId);
    List<Resource> findByOwnerUserId(String userId);
}