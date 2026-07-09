package com.cloudnative.voting.service;

import com.cloudnative.voting.dto.VoteRequest;
import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.model.Vote;
import com.cloudnative.voting.repository.CandidateRepository;
import com.cloudnative.voting.repository.UserRepository;
import com.cloudnative.voting.repository.VoteRepository;
import com.cloudnative.voting.dto.DailyVoteCountResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Candidate candidate = candidateRepository
                .findById(request.getCandidateId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        Long organizationId = candidate.getOrganizationId();

        if (organizationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate is not assigned to an organization");
        }

        if (voteRepository.existsByUserIdAndOrganizationId(user.getId(), organizationId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already voted in this organization");
        }

        Vote vote = new Vote();

        vote.setUserId(user.getId());
        vote.setCandidateId(candidate.getId());
        vote.setOrganizationId(organizationId);
        vote.setTimestamp(LocalDateTime.now());

        try {
            voteRepository.save(vote);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already voted in this organization");
        }

        candidate.setVoteCount(
                candidate.getVoteCount() + 1);

        candidateRepository.save(candidate);

        return "Vote Cast Successfully";
    }

    public boolean hasUserVotedInOrganization(Long userId, Long organizationId) {
        return voteRepository.existsByUserIdAndOrganizationId(userId, organizationId);
    }

    public List<DailyVoteCountResponse> getDailyVoteCounts() {
        Map<String, Long> countsByDate = new LinkedHashMap<>();

        voteRepository.findAllByOrderByTimestampAsc().forEach(vote -> {
            if (vote.getTimestamp() == null) {
                return;
            }

            String date = vote.getTimestamp().toLocalDate().format(DateTimeFormatter.ISO_DATE);
            countsByDate.put(date, countsByDate.getOrDefault(date, 0L) + 1L);
        });

        return countsByDate.entrySet().stream()
                .map(entry -> new DailyVoteCountResponse(entry.getKey(), entry.getValue()))
                .toList();
    }
}
