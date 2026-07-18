package com.cloudnative.voting.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * A Vote is cast by a User for a Candidate in a specific Election.
 * The unique constraint (user_id, election_id) prevents double-voting per election.
 */
@Entity
@Table(name = "vote",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "election_id"}, name = "uq_vote_user_election"),
                // Legacy constraint kept for backward compatibility
                @UniqueConstraint(columnNames = {"user_id", "organization_id"}, name = "uq_vote_user_org")
        })
public class Vote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "election_id")
    private Long electionId;

    @Column(name = "organization_id")
    private Long organizationId;

    private LocalDateTime timestamp;

    public Vote() {}

    public Vote(Long id, Long userId, Long candidateId, Long electionId, Long organizationId, LocalDateTime timestamp) {
        this.id = id;
        this.userId = userId;
        this.candidateId = candidateId;
        this.electionId = electionId;
        this.organizationId = organizationId;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
