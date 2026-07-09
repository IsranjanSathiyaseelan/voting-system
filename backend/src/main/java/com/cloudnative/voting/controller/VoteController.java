package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.VoteStatusResponse;
import com.cloudnative.voting.dto.DailyVoteCountResponse;
import com.cloudnative.voting.dto.VoteRequest;
import com.cloudnative.voting.service.VoteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public ResponseEntity<String> castVote(@RequestBody VoteRequest request) {
        String message = voteService.castVote(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @GetMapping("/status")
    public VoteStatusResponse getVoteStatus(
            @RequestParam Long userId,
            @RequestParam Long organizationId) {
        return new VoteStatusResponse(
                voteService.hasUserVotedInOrganization(userId, organizationId));
    }

    @GetMapping("/daily")
    public java.util.List<DailyVoteCountResponse> getDailyVotes() {
        return voteService.getDailyVoteCounts();
    }
}
