package com.p2p.exchange.controller;

import com.p2p.exchange.model.Resource;
import com.p2p.exchange.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000") //  THIS IS THE VIP PASS
@RequestMapping("/api/resources") // The address: localhost:8080/api/resources
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping("/add/{userId}")
    public ResponseEntity<String> addResource(@PathVariable String userId, @RequestBody Resource resource) {
        String result = resourceService.addResource(userId, resource);
        return ResponseEntity.ok(result); // This sends a clean "OK" status to React
    }

    // This lets anyone see ALL available resources in the market
    @GetMapping("/all")
    public List<Resource> getAll() {
        return resourceService.getAllResources();
    }

    @PostMapping("/buy/{buyerId}/{resourceId}")
    public String buyResource(@PathVariable String buyerId, @PathVariable Long resourceId) {
        return resourceService.purchaseResource(buyerId, resourceId);
    }

    @GetMapping("/owner/{userId}")
    public List<Resource> getByOwner(@PathVariable String userId) {
        // This tells the service to go find only skills belonging to this specific User ID
        return resourceService.getResourcesByOwner(userId);
    }

    // --- NEW: The Delete Endpoint (Using the Service!) ---
    @DeleteMapping("/delete/{resourceId}")
    public org.springframework.http.ResponseEntity<String> deleteResource(@PathVariable Long resourceId) {
        // Now the Controller politely asks the Service to handle the deletion
        resourceService.deleteResource(resourceId);
        return org.springframework.http.ResponseEntity.ok("Skill permanently deleted.");
    }
}