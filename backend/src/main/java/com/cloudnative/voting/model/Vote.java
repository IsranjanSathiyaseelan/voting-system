package com.cloudnative.voting.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vote", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "organization_id" }))
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "user_id")
    private Long userId;
    @Column(name = "candidate_id")
    private Long candidateId;
    @Column(name = "organization_id")
    private Long organizationId;
    private LocalDateTime timestamp;

    public Vote() {
    }

    public Vote(Long id, Long userId, Long candidateId, Long organizationId, LocalDateTime timestamp) {
        this.id = id;
        this.userId = userId;
        this.candidateId = candidateId;
        this.organizationId = organizationId;
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

    public Long getOrganizationId() {
        return organizationId;
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

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
