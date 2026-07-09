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

@Service
@Transactional
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final CandidateRepository candidateRepository;

    public OrganizationService(
            OrganizationRepository organizationRepository,
            CandidateRepository candidateRepository) {
        this.organizationRepository = organizationRepository;
        this.candidateRepository = candidateRepository;
    }

    public List<Organization> getAll() {
        return organizationRepository.findAll();
    }

    public Organization getById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Organization create(Organization organization) {
        validateName(organization.getName());
        organization.setId(null);
        return organizationRepository.save(organization);
    }

    public Organization update(Long id, Organization organization) {
        Organization existing = getById(id);
        validateName(organization.getName());
        existing.setName(organization.getName());
        existing.setDescription(organization.getDescription());
        existing.setIcon(organization.getIcon());
        return organizationRepository.save(existing);
    }

    public void delete(Long id) {
        Organization existing = getById(id);
        candidateRepository.deleteByOrganization_Id(id);
        organizationRepository.delete(existing);
    }

    private static void validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Organization name is required");
        }
    }
}
