package com.p2p.exchange.service;

import com.p2p.exchange.model.Resource;
import com.p2p.exchange.model.Student;
import com.p2p.exchange.repository.ResourceRepository;
import com.p2p.exchange.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional; // Add this import at the top
import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private StudentRepository studentRepository;

    public String addResource(String userId, Resource resource) {
        // 1. Find the student who wants to list this
        Student owner = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Student not found!"));

        // 2. Link the resource to that student
        resource.setOwner(owner);

        // 3. Save it
        resourceRepository.save(resource);
        return "Resource listed successfully by " + userId;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }
    @Transactional
    public String purchaseResource(String buyerId, Long resourceId) {
        // 1. Find the Buyer
        Student buyer = studentRepository.findByUserId(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found!"));

        // 2. Find the Resource (The Skill/Item)
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found!"));

        // 3. Find the Seller (Owner)
        Student seller = resource.getOwner();


        // 4. Check if Buyer has enough Token Credits
        if (buyer.getAvailableBalance() < resource.getPrice()) {
            return "Error: You don't have enough TC!";
        }

        // 5. The Exchange (Subtract from buyer, add to seller)
        buyer.setAvailableBalance(buyer.getAvailableBalance() - resource.getPrice());
        seller.setAvailableBalance(seller.getAvailableBalance() + resource.getPrice());

        // 6. Save the new balances
        studentRepository.save(buyer);
        studentRepository.save(seller);

        return "Purchase successful! You bought " + resource.getTitle() + " from " + seller.getUserId();
    }
    public List<Resource> getResourcesByOwner(String userId) {
        return resourceRepository.findByOwnerUserId(userId);
    }
    // --- NEW: The Delete Logic ---
    public void deleteResource(Long resourceId) {
        resourceRepository.deleteById(resourceId);
    }
}
