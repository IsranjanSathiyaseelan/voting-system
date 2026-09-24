package com.cloudnative.voting.service;

import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.model.Role;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.repository.CandidateRepository;
import com.cloudnative.voting.repository.ElectionRepository;
import com.cloudnative.voting.repository.OrganizationRepository;
import com.cloudnative.voting.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final ElectionRepository electionRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    public CandidateService(CandidateRepository candidateRepository,
                            ElectionRepository electionRepository,
                            OrganizationRepository organizationRepository,
                            UserRepository userRepository) {
        this.candidateRepository = candidateRepository;
        this.electionRepository = electionRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Add a candidate (tenant-scoped).
     * Candidate automatically belongs to the caller's organization.
     * Validates election (if provided) also belongs to caller's organization.
     */
    public Candidate addCandidate(Candidate candidate, Long callerOrgId) {
        // Automatically bind candidate to the caller's organization
        Organization org = organizationRepository.findById(callerOrgId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
        candidate.setOrganization(org);
        candidate.setOrganizationId(callerOrgId);

        Long electionId = candidate.getElectionId();
        if (electionId != null) {
            Election election = electionRepository.findById(electionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));

            if (!election.getOrganization().getId().equals(callerOrgId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Election does not belong to your organization");
            }
            candidate.setElection(election);
        }

        return candidateRepository.save(candidate);
    }

    /**
     * Assign an existing candidate to an election (tenant-scoped).
     * Enforces that both candidate and election belong to the caller's organization.
     */
    public Candidate assignCandidateToElection(Long candidateId, Long electionId, Long callerOrgId) {
        Candidate candidate = candidateRepository.findById(candidateId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Candidate not found"));

        Long candidateOrgId = candidate.getOrganization() != null
                ? candidate.getOrganization().getId()
                : (candidate.getElection() != null && candidate.getElection().getOrganization() != null
                    ? candidate.getElection().getOrganization().getId()
                    : null);

        if (candidateOrgId == null || !candidateOrgId.equals(callerOrgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Candidate does not belong to your organization");
        }

        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));

        if (election.getOrganization() == null || !election.getOrganization().getId().equals(callerOrgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Election does not belong to your organization");
        }

        // If candidate has no election, attach directly
        if (candidate.getElection() == null) {
            candidate.setElection(election);
            if (candidate.getOrganization() == null) {
                candidate.setOrganization(election.getOrganization());
            }
            return candidateRepository.save(candidate);
        } else if (candidate.getElection().getId().equals(electionId)) {
            return candidate;
        } else {
            // Already assigned to another election; create an entry for this election
            Candidate newCandidate = new Candidate();
            newCandidate.setName(candidate.getName());
            newCandidate.setParty(candidate.getParty());
            newCandidate.setVoteCount(0);
            newCandidate.setOrganization(election.getOrganization());
            newCandidate.setElection(election);
            return candidateRepository.save(newCandidate);
        }
    }

    /** Tenant-scoped: all candidates for a given election. */
    public List<Candidate> getCandidatesByElection(Long electionId, Long callerOrgId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));
        if (!election.getOrganization().getId().equals(callerOrgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Election does not belong to your organization");
        }
        return candidateRepository.findByElection_Id(electionId);
    }

    /** Tenant-scoped: results sorted for a given election. */
    public List<Candidate> getResultsByElection(Long electionId, Long callerOrgId) {
        Election election = electionRepository.findById(electionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));
        if (!election.getOrganization().getId().equals(callerOrgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Election does not belong to your organization");
        }
        return candidateRepository.findByElection_IdOrderByVoteCountDesc(electionId);
    }

    /** Legacy org-level queries (preserved for existing UI compatibility). */
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    public List<Candidate> getResults() {
        return candidateRepository.findAll();
    }

    public List<Candidate> getCandidatesByOrganization(Long organizationId) {
        List<Candidate> candidates = candidateRepository.findByOrganizationIdOrElectionOrganizationId(organizationId);

        // Filter out admin users from candidate list
        List<User> orgUsers = userRepository.findByOrganizationId(organizationId);
        Set<String> adminIdentifiers = orgUsers.stream()
                .filter(u -> u.getRole() == Role.ORGANIZATION_ADMIN)
                .flatMap(u -> {
                    Stream.Builder<String> b = Stream.builder();
                    if (u.getUsername() != null) b.add(u.getUsername().trim().toLowerCase());
                    if (u.getEmail() != null) b.add(u.getEmail().trim().toLowerCase());
                    String fullName = ((u.getFirstName() != null ? u.getFirstName() : "") + " " +
                                       (u.getLastName() != null ? u.getLastName() : "")).trim().toLowerCase();
                    if (!fullName.isEmpty()) b.add(fullName);
                    return b.build();
                })
                .collect(Collectors.toSet());

        return candidates.stream()
                .filter(c -> c.getName() != null && !adminIdentifiers.contains(c.getName().trim().toLowerCase()))
                .filter(c -> c.getParty() == null || !adminIdentifiers.contains(c.getParty().trim().toLowerCase()))
                .distinct()
                .toList();
    }

    public List<Candidate> getResultsByOrganization(Long organizationId) {
        return candidateRepository.findByOrganization_IdOrderByVoteCountDesc(organizationId)
                .stream()
                .sorted(Comparator.comparingInt(Candidate::getVoteCount).reversed())
                .toList();
    }
}
