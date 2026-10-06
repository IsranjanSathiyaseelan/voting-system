package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.dto.DashboardStatsResponse;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.repository.ElectionRepository;
import com.cloudnative.voting.repository.PollRepository;
import com.cloudnative.voting.repository.UserRepository;
import com.cloudnative.voting.repository.VoteRepository;
import com.cloudnative.voting.service.OrganizationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final ElectionRepository electionRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final PollRepository pollRepository;

    public OrganizationController(
            OrganizationService organizationService,
            ElectionRepository electionRepository,
            VoteRepository voteRepository,
            UserRepository userRepository,
            PollRepository pollRepository) {
        this.organizationService = organizationService;
        this.electionRepository = electionRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.pollRepository = pollRepository;
    }

    /** List all organizations — returns only the caller's own organization. */
    @GetMapping
    public List<Organization> getAll() {
        Long callerOrgId = SecurityUtils.getCurrentOrganizationIdOrNull();
        if (callerOrgId != null) {
            Organization org = organizationService.getById(callerOrgId);
            return List.of(org);
        }
        // Fallback for users without an org (should not normally happen)
        return List.of();
    }

    /** Update organization — restricted to the caller's own organization. */
    @PutMapping("/{id}")
    public Organization update(@PathVariable Long id, @RequestBody Organization organization) {
        assertCallerOwnsOrg(id);
        return organizationService.update(id, organization);
    }

    /** Delete organization — restricted to the caller's own organization. */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        assertCallerOwnsOrg(id);
        organizationService.delete(id);
    }

    /** Public listing of organizations — available without authentication for registration. */
    @GetMapping("/public")
    public List<Organization> getPublicOrganizations() {
        return organizationService.getAll();
    }

    /**
     * Dashboard statistics for the authenticated user's org.
     * Always scoped to the caller's organization from the JWT — never trusts client-sent IDs.
     */
    @GetMapping("/dashboard/stats")
    public DashboardStatsResponse getDashboardStats() {
        Long orgId = SecurityUtils.getCurrentOrganizationId();

        long totalMembers = userRepository.countByOrganizationId(orgId);
        List<Election> elections = electionRepository.findByOrganizationId(orgId);
        long totalVotes = voteRepository.countByOrganizationId(orgId);
        long totalPolls = pollRepository.countByOrganizationId(orgId);

        long totalElections  = elections.size();
        long activeElections = elections.stream().filter(Election::isActive).count();
        return new DashboardStatsResponse(totalMembers, totalElections, activeElections, totalVotes, totalPolls);
    }

    /**
     * Asserts that the path-variable org ID matches the authenticated caller's organization.
     * Throws 403 if there is a mismatch or the caller has no organization.
     */
    private void assertCallerOwnsOrg(Long pathOrgId) {
        Long callerOrgId = SecurityUtils.getCurrentOrganizationId();
        if (!callerOrgId.equals(pathOrgId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied: you can only access your own organization's data"
            );
        }
    }
}
