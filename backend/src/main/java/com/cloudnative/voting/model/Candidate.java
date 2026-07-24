package com.cloudnative.voting.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "candidate")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String party;

    @Column(name = "vote_count")
    private Integer voteCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "election_id")
    private Election election;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id")
    private Organization organization;

    // Transient fields for receiving JSON IDs from API requests
    @Transient
    @JsonProperty("electionId")
    private Long electionId;

    @Transient
    @JsonProperty("organizationId")
    private Long organizationId;

    public Candidate() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getParty() { return party; }
    public void setParty(String party) { this.party = party; }

    public Integer getVoteCount() { return voteCount; }
    public void setVoteCount(Integer voteCount) { this.voteCount = voteCount; }

    public Election getElection() { return election; }
    public void setElection(Election election) { this.election = election; }

    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }

    public Long getElectionId() {
        if (this.electionId != null) {
            return this.electionId;
        }
        return this.election != null ? this.election.getId() : null;
    }

    public void setElectionId(Long electionId) {
        this.electionId = electionId;
    }

    public Long getOrganizationId() {
        if (this.organizationId != null) {
            return this.organizationId;
        }
        return this.organization != null ? this.organization.getId() : null;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
}