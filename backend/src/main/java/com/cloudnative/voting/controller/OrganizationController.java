package com.cloudnative.voting.controller;

import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.service.CandidateService;
import com.cloudnative.voting.service.OrganizationService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final CandidateService candidateService;

    public OrganizationController(
            OrganizationService organizationService,
            CandidateService candidateService) {
        this.organizationService = organizationService;
        this.candidateService = candidateService;
    }

    @GetMapping
    public List<Organization> getAll() {
        return organizationService.getAll();
    }

    @GetMapping("/{id}")
    public Organization getById(@PathVariable Long id) {
        return organizationService.getById(id);
    }

    @PostMapping
    public Organization create(@RequestBody Organization organization) {
        return organizationService.create(organization);
    }

    @PutMapping("/{id}")
    public Organization update(
            @PathVariable Long id,
            @RequestBody Organization organization) {
        return organizationService.update(id, organization);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        organizationService.delete(id);
    }

    @GetMapping("/{id}/candidates")
    public List<Candidate> getCandidates(@PathVariable Long id) {
        return candidateService.getCandidatesByOrganization(id);
    }

    @GetMapping("/{id}/results")
    public List<Candidate> getResults(@PathVariable Long id) {
        return candidateService.getResultsByOrganization(id);
    }
}
