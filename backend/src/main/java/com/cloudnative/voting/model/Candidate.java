package com.cloudnative.voting.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

/**
 * A Candidate belongs to one Election, which belongs to one Organization.
 * This establishes the Candidate -> Election -> Organization hierarchy.
 */
@Entity
@Table(name = "candidate")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int voteCount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "election_id")
    @JsonIgnore
    private Election election;

    /** Kept for backward-compatibility with legacy org-level queries. */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id")
    @JsonIgnore
    private Organization organization;

    public Candidate() {}

    public Candidate(Long id, String name, int voteCount) {
        this.id = id;
        this.name = name;
        this.voteCount = voteCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getVoteCount() { return voteCount; }
    public void setVoteCount(int voteCount) { this.voteCount = voteCount; }

    public Election getElection() { return election; }
    public void setElection(Election election) {
        this.election = election;
        // Keep organization in sync for legacy queries
        if (election != null) {
            this.organization = election.getOrganization();
        }
    }

    public Long getElectionId() {
        return election != null ? election.getId() : null;
    }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Long getOrganizationId() {
        if (organization != null) return organization.getId();
        if (election != null && election.getOrganization() != null) return election.getOrganization().getId();
        return null;
    }
}
