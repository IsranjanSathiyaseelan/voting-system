package com.cloudnative.voting.service;

import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.repository.CandidateRepository;
import com.cloudnative.voting.repository.OrganizationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Comparator;

@Service
@Transactional
public class CandidateService {

    private final CandidateRepository candidateRepository;
    private final OrganizationRepository organizationRepository;

    public CandidateService(
            CandidateRepository candidateRepository,
            OrganizationRepository organizationRepository) {
        this.candidateRepository = candidateRepository;
        this.organizationRepository = organizationRepository;
    }

    public Candidate addCandidate(Candidate candidate) {
        if (candidate.getOrganizationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization is required");
        }

        Organization organization = organizationRepository.findById(candidate.getOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        candidate.setOrganization(organization);
        return candidateRepository.save(candidate);
    }

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
