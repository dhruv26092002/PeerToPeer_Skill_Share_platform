package com.p2p.exchange.model;

import jakarta.persistence.*;

@Entity
@Table(name = "resources") // Tells PostgreSQL to name the table exactly this
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Spring Boot will automatically count 1, 2, 3 for you

    private String title;
    private String category;

    @Column(length = 1000) // Pro-tip: This tells PostgreSQL to allow long paragraphs for descriptions
    private String description;
    @ManyToOne
    private Student owner;
    private Double price;
    private String status;
    private String timestamp;
    private Double rating;
    private Integer reviewCount;

    // --- GETTERS AND SETTERS (The "Doors" so your React app can read/write data) ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }

    public Student getOwner() { return owner; }
    public void setOwner(Student owner) { this.owner = owner; }
}