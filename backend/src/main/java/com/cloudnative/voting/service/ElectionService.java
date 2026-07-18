package com.cloudnative.voting.service;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.dto.ElectionRequest;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.repository.ElectionRepository;
import com.cloudnative.voting.repository.OrganizationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ElectionService {

    private final ElectionRepository electionRepository;
    private final OrganizationRepository organizationRepository;

    public ElectionService(ElectionRepository electionRepository,
                           OrganizationRepository organizationRepository) {
        this.electionRepository = electionRepository;
        this.organizationRepository = organizationRepository;
    }

    public List<Election> getElectionsByOrg(Long organizationId) {
        return electionRepository.findByOrganizationId(organizationId);
    }

    public List<Election> getActiveElectionsByOrg(Long organizationId) {
        return electionRepository.findByOrganizationIdAndActive(organizationId, true);
    }

    public Election getById(Long id, Long organizationId) {
        Election election = electionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Election not found"));
        assertBelongsToOrg(election, organizationId);
        return election;
    }

    public Election create(ElectionRequest request, Long organizationId) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Election title is required");
        }

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        Election election = new Election();
        election.setTitle(request.getTitle().trim());
        election.setDescription(request.getDescription());
        election.setStartDate(request.getStartDate());
        election.setEndDate(request.getEndDate());
        election.setActive(request.isActive());
        election.setOrganization(org);

        return electionRepository.save(election);
    }

    public Election update(Long id, ElectionRequest request, Long organizationId) {
        Election election = getById(id, organizationId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            election.setTitle(request.getTitle().trim());
        }
        election.setDescription(request.getDescription());
        election.setStartDate(request.getStartDate());
        election.setEndDate(request.getEndDate());
        election.setActive(request.isActive());

        return electionRepository.save(election);
    }

    public void delete(Long id, Long organizationId) {
        Election election = getById(id, organizationId);
        electionRepository.delete(election);
    }

    private void assertBelongsToOrg(Election election, Long organizationId) {
        if (election.getOrganization() == null || !election.getOrganization().getId().equals(organizationId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Election does not belong to your organization");
        }
    }
}
