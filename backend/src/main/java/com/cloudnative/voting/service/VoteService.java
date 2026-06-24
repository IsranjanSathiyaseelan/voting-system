package com.cloudnative.voting.service;

import com.cloudnative.voting.dto.VoteRequest;
import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.model.Vote;
import com.cloudnative.voting.repository.CandidateRepository;
import com.cloudnative.voting.repository.UserRepository;
import com.cloudnative.voting.repository.VoteRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final CandidateRepository candidateRepository;

    public VoteService(
            VoteRepository voteRepository,
            UserRepository userRepository,
            CandidateRepository candidateRepository) {

        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
    }

    public String castVote(VoteRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Candidate candidate = candidateRepository
                .findById(request.getCandidateId())
                .orElseThrow(() ->
                        new RuntimeException("Candidate not found"));

        if (voteRepository.existsByUserId(user.getId())) {
            throw new RuntimeException("User already voted");
        }

        Vote vote = new Vote();

        vote.setUserId(user.getId());
        vote.setCandidateId(candidate.getId());
        vote.setTimestamp(LocalDateTime.now());

        voteRepository.save(vote);

        candidate.setVoteCount(
                candidate.getVoteCount() + 1
        );

        candidateRepository.save(candidate);

        return "Vote Cast Successfully";
    }
}
