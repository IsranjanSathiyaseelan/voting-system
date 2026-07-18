package com.cloudnative.voting.service;

import com.cloudnative.voting.dto.DailyVoteCountResponse;
import com.cloudnative.voting.dto.VoteRequest;
import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.model.Vote;
import com.cloudnative.voting.repository.CandidateRepository;
import com.cloudnative.voting.repository.ElectionRepository;
import com.cloudnative.voting.repository.UserRepository;
import com.cloudnative.voting.repository.VoteRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    private final ElectionRepository electionRepository;

    public VoteService(VoteRepository voteRepository,
                       UserRepository userRepository,
                       CandidateRepository candidateRepository,
                       ElectionRepository electionRepository) {
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.candidateRepository = candidateRepository;
        this.electionRepository = electionRepository;
    }

    public String castVote(String username, VoteRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Candidate candidate = candidateRepository.findById(request.getCandidateId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        Long organizationId = candidate.getOrganizationId();
        if (organizationId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Candidate is not assigned to an organization");
        }

        if (user.getOrganization() == null || !organizationId.equals(user.getOrganization().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot vote in another organization's election");
        }

        Long electionId = request.getElectionId() != null
                ? request.getElectionId()
                : candidate.getElectionId();

        // Election-level duplicate vote check (preferred)
        if (electionId != null) {
            Election election = electionRepository.findById(electionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));

            if (!election.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This election is no longer active");
            }

            if (voteRepository.existsByUserIdAndElectionId(user.getId(), electionId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already voted in this election");
            }
        } else {
            // Legacy org-level duplicate check
            if (voteRepository.existsByUserIdAndOrganizationId(user.getId(), organizationId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already voted in this organization");
            }
        }

        Vote vote = new Vote();
        vote.setUserId(user.getId());
        vote.setCandidateId(candidate.getId());
        vote.setElectionId(electionId);
        vote.setOrganizationId(organizationId);
        vote.setTimestamp(LocalDateTime.now());

        try {
            voteRepository.save(vote);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already voted");
        }

        // Increment candidate vote count atomically within the same transaction
        candidate.setVoteCount(candidate.getVoteCount() + 1);
        candidateRepository.save(candidate);

        return "Vote cast successfully";
    }

    public boolean hasUserVotedInOrganization(Long userId, Long organizationId) {
        return voteRepository.existsByUserIdAndOrganizationId(userId, organizationId);
    }

    public boolean hasUserVotedInElection(Long userId, Long electionId) {
        return voteRepository.existsByUserIdAndElectionId(userId, electionId);
    }

    public List<DailyVoteCountResponse> getDailyVoteCounts() {
        return buildDailyCountsFromVotes(voteRepository.findAllByOrderByTimestampAsc());
    }

    public List<DailyVoteCountResponse> getDailyVoteCountsByOrg(Long organizationId) {
        return buildDailyCountsFromVotes(voteRepository.findByOrganizationIdOrderByTimestampAsc(organizationId));
    }

    private List<DailyVoteCountResponse> buildDailyCountsFromVotes(List<Vote> votes) {
        Map<String, Long> countsByDate = new LinkedHashMap<>();
        votes.forEach(vote -> {
            if (vote.getTimestamp() == null) return;
            String date = vote.getTimestamp().toLocalDate().format(DateTimeFormatter.ISO_DATE);
            countsByDate.merge(date, 1L, Long::sum);
        });
        return countsByDate.entrySet().stream()
                .map(e -> new DailyVoteCountResponse(e.getKey(), e.getValue()))
                .toList();
    }
}
