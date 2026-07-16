package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.dto.DailyVoteCountResponse;
import com.cloudnative.voting.dto.VoteRequest;
import com.cloudnative.voting.dto.VoteStatusResponse;
import com.cloudnative.voting.service.VoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public ResponseEntity<String> castVote(@RequestBody VoteRequest request) {
        String username = SecurityUtils.getCurrentUser().getUsername();
        String message = voteService.castVote(username, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    /** Check if a user has voted in an org (legacy support). */
    @GetMapping("/status")
    public VoteStatusResponse getVoteStatus(
            @RequestParam Long userId,
            @RequestParam Long organizationId) {
        return new VoteStatusResponse(voteService.hasUserVotedInOrganization(userId, organizationId));
    }

    /** Check if a user has voted in a specific election. */
    @GetMapping("/status/election")
    public VoteStatusResponse getElectionVoteStatus(
            @RequestParam Long userId,
            @RequestParam Long electionId) {
        return new VoteStatusResponse(voteService.hasUserVotedInElection(userId, electionId));
    }

    /** Daily vote counts — org-scoped for the authenticated user. */
    @GetMapping("/daily")
    public List<DailyVoteCountResponse> getDailyVotes() {
        Long orgId = SecurityUtils.getCurrentOrganizationId();
        return voteService.getDailyVoteCountsByOrg(orgId);
    }
}
