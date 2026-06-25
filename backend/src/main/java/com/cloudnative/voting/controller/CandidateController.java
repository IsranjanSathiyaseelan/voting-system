package com.cloudnative.voting.controller;

import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.service.CandidateService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
public class CandidateController {

    private final CandidateService candidateService;

    public CandidateController(CandidateService candidateService) {
        this.candidateService = candidateService;
    }

    @PostMapping
    public Candidate addCandidate(@RequestBody Candidate candidate) {
        return candidateService.addCandidate(candidate);
    }

    @GetMapping
    public List<Candidate> getCandidates() {
        return candidateService.getAllCandidates();
    }

    @GetMapping("/results")
    public List<Candidate> getResults() {
        return candidateService.getResults();
    }
}
