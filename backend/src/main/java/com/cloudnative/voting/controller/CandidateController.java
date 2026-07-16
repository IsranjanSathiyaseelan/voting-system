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

    /** Add candidate (tenant-aware, validates election belongs to caller's org). */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Candidate addCandidate(@RequestBody Candidate candidate) {
        Long callerOrgId = SecurityUtils.getCurrentOrganizationId();
        return candidateService.addCandidate(candidate, callerOrgId);
    }

    /** Legacy: list all candidates across the org (used by existing UI). */
    @GetMapping
    public List<Candidate> getCandidates() {
        return candidateService.getCandidatesByOrganization(SecurityUtils.getCurrentOrganizationId());
    }

    /** Legacy: results across the org sorted by vote count. */
    @GetMapping("/results")
    public List<Candidate> getResults() {
        return candidateService.getResultsByOrganization(SecurityUtils.getCurrentOrganizationId());
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
}
