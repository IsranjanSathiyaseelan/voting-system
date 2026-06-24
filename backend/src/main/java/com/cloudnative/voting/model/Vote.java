package com.cloudnative.voting.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vote")
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Long candidateId;
    private LocalDateTime timestamp;
    public Vote() {
    }

    public Vote(Long id, Long userId, Long candidateId, LocalDateTime timestamp) {
        this.id = id;
        this.userId = userId;
        this.candidateId = candidateId;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getCandidateId() {
        return candidateId;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
