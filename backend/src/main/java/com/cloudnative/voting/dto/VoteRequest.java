package com.cloudnative.voting.dto;

public class VoteRequest {

    private Long userId;
    private Long candidateId;

    /** Election this vote is cast in (preferred). */
    private Long electionId;

    public VoteRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public Long getElectionId() { return electionId; }
    public void setElectionId(Long electionId) { this.electionId = electionId; }
}
