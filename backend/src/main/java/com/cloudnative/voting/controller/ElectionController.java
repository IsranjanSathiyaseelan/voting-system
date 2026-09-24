package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.dto.ElectionRequest;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.service.ElectionService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Election management.
 * All operations are scoped to the authenticated user's organization.
 * Read endpoints fall back to returning all elections when the user has no org.
 */
@RestController
@RequestMapping("/api/elections")
public class ElectionController {

    private final ElectionService electionService;

    public ElectionController(ElectionService electionService) {
        this.electionService = electionService;
    }

    @GetMapping
    public List<Election> getAll() {
        Long orgId = SecurityUtils.getCurrentOrganizationIdOrNull();
        if (orgId == null) {
            return electionService.getAllElections();
        }
        return electionService.getElectionsByOrg(orgId);
    }

    @GetMapping("/active")
    public List<Election> getActive() {
        Long orgId = SecurityUtils.getCurrentOrganizationIdOrNull();
        if (orgId == null) {
            return electionService.getAllActiveElections();
        }
        return electionService.getActiveElectionsByOrg(orgId);
    }

    @GetMapping("/{id}")
    public Election getById(@PathVariable Long id) {
        Long orgId = SecurityUtils.getCurrentOrganizationIdOrNull();
        if (orgId == null) {
            return electionService.getAllElections().stream()
                    .filter(e -> e.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                            HttpStatus.NOT_FOUND, "Election not found"));
        }
        return electionService.getById(id, orgId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Election create(@RequestBody ElectionRequest request) {
        return electionService.create(request, SecurityUtils.getCurrentOrganizationId());
    }

    @PutMapping("/{id}")
    public Election update(@PathVariable Long id, @RequestBody ElectionRequest request) {
        return electionService.update(id, request, SecurityUtils.getCurrentOrganizationId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        electionService.delete(id, SecurityUtils.getCurrentOrganizationId());
    }
}

