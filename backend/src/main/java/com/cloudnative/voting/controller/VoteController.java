package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.VoteRequest;
import com.cloudnative.voting.service.VoteService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public String castVote(
            @RequestBody VoteRequest request) {

        return voteService.castVote(request);
    }
}
