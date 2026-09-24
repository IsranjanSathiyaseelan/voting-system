package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.service.CandidateService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    /** Add candidate (tenant-aware, candidate automatically belongs to caller's org). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Candidate addCandidate(@RequestBody Candidate candidate) {
        Long callerOrgId = SecurityUtils.getCurrentOrganizationId();
        // Always force candidate to belong to caller's organization, ignoring any client-sent orgId
        candidate.setOrganizationId(callerOrgId);
        return candidateService.addCandidate(candidate, callerOrgId);
    }

    /** Legacy: list all candidates — scoped to caller's org if they have one, otherwise all. */
    @GetMapping
    public List<Candidate> getCandidates() {
        Long callerOrgId = SecurityUtils.getCurrentOrganizationIdOrNull();
        if (callerOrgId == null) {
            return candidateService.getAllCandidates();
        }
        return candidateService.getCandidatesByOrganization(callerOrgId);
    }

    /** Legacy: results sorted by vote count — scoped to caller's org if they have one, otherwise all. */
    @GetMapping("/results")
    public List<Candidate> getResults() {
        Long callerOrgId = SecurityUtils.getCurrentOrganizationIdOrNull();
        if (callerOrgId == null) {
            return candidateService.getResults();
        }
        return candidateService.getResultsByOrganization(callerOrgId);
    }

    /** Election-scoped: candidates for a specific election. */
    @GetMapping("/election/{electionId}")
    public List<Candidate> getByElection(@PathVariable Long electionId) {
        return candidateService.getCandidatesByElection(electionId, SecurityUtils.getCurrentOrganizationId());
    }

    /** Election-scoped: results for a specific election sorted by vote count. */
    @GetMapping("/election/{electionId}/results")
    public List<Candidate> getResultsByElection(@PathVariable Long electionId) {
        return candidateService.getResultsByElection(electionId, SecurityUtils.getCurrentOrganizationId());
    }

    /** Assign an existing candidate to an election (tenant-scoped). */
    @PutMapping("/{candidateId}/assign/{electionId}")
    public Candidate assignCandidateToElection(
            @PathVariable Long candidateId,
            @PathVariable Long electionId) {
        Long callerOrgId = SecurityUtils.getCurrentOrganizationId();
        return candidateService.assignCandidateToElection(candidateId, electionId, callerOrgId);
    }
}

