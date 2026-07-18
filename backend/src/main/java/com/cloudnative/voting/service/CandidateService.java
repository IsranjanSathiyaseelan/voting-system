package com.cloudnative.voting.service;

import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.repository.CandidateRepository;
import com.cloudnative.voting.repository.ElectionRepository;
import com.cloudnative.voting.repository.OrganizationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final ElectionRepository electionRepository;
    private final OrganizationRepository organizationRepository;

    public CandidateService(CandidateRepository candidateRepository,
                            ElectionRepository electionRepository,
                            OrganizationRepository organizationRepository) {
        this.candidateRepository = candidateRepository;
        this.electionRepository = electionRepository;
        this.organizationRepository = organizationRepository;
    }

    /**
     * Add a candidate to a specific election.
     * Validates the election belongs to the requesting organization.
     */
    public Candidate addCandidate(Candidate candidate, Long callerOrgId) {
        Long electionId = candidate.getElectionId();

        if (electionId == null && candidate.getOrganizationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Either electionId or organizationId is required");
        }

        if (electionId != null) {
            Election election = electionRepository.findById(electionId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));

            if (!election.getOrganization().getId().equals(callerOrgId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Election does not belong to your organization");
            }
            candidate.setElection(election); // also syncs organization
        } else {
            // Legacy fallback: org-level candidate (no election)
            Organization org = organizationRepository.findById(candidate.getOrganizationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
            if (!org.getId().equals(callerOrgId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot add candidate to another organization");
            }
            candidate.setOrganization(org);
        }

        return candidateRepository.save(candidate);
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
        return candidateRepository.findByOrganization_Id(organizationId);
    }

    public List<Candidate> getResultsByOrganization(Long organizationId) {
        return candidateRepository.findByOrganization_IdOrderByVoteCountDesc(organizationId)
                .stream()
                .sorted(Comparator.comparingInt(Candidate::getVoteCount).reversed())
                .toList();
    }
}
