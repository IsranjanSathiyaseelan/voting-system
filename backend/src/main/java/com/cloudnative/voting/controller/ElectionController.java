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
        return electionService.getElectionsByOrg(SecurityUtils.getCurrentOrganizationId());
    }

    @GetMapping("/active")
    public List<Election> getActive() {
        return electionService.getActiveElectionsByOrg(SecurityUtils.getCurrentOrganizationId());
    }

    @GetMapping("/{id}")
    public Election getById(@PathVariable Long id) {
        return electionService.getById(id, SecurityUtils.getCurrentOrganizationId());
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
