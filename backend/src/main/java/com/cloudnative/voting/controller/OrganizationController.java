package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.dto.DashboardStatsResponse;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.model.Candidate;
import com.cloudnative.voting.model.Election;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.repository.ElectionRepository;
import com.cloudnative.voting.repository.PollRepository;
import com.cloudnative.voting.repository.UserRepository;
import com.cloudnative.voting.repository.VoteRepository;
import com.cloudnative.voting.service.CandidateService;
import com.cloudnative.voting.service.OrganizationService;
import com.cloudnative.voting.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;
    private final CandidateService candidateService;
    private final UserService userService;
    private final ElectionRepository electionRepository;
    private final VoteRepository voteRepository;
    private final UserRepository userRepository;
    private final PollRepository pollRepository;

    public OrganizationController(
            OrganizationService organizationService,
            CandidateService candidateService,
            UserService userService,
            ElectionRepository electionRepository,
            VoteRepository voteRepository,
            UserRepository userRepository,
            PollRepository pollRepository) {
        this.organizationService = organizationService;
        this.candidateService = candidateService;
        this.userService = userService;
        this.electionRepository = electionRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.pollRepository = pollRepository;
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
    public Organization update(@PathVariable Long id, @RequestBody Organization organization) {
        return organizationService.update(id, organization);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        organizationService.delete(id);
    }

    /** Legacy: candidates for a given org. */
    @GetMapping("/{id}/candidates")
    public List<Candidate> getCandidates(@PathVariable Long id) {
        return candidateService.getCandidatesByOrganization(id);
    }

    /** Legacy: results for a given org. */
    @GetMapping("/{id}/results")
    public List<Candidate> getResults(@PathVariable Long id) {
        return candidateService.getResultsByOrganization(id);
    }

    /** Elections for a given org. */
    @GetMapping("/{id}/elections")
    public List<Election> getElections(@PathVariable Long id) {
        return electionRepository.findByOrganizationId(id);
    }

    /** Members (users) for a given org. */
    @GetMapping("/{id}/members")
    public List<UserResponse> getMembers(@PathVariable Long id) {
        return userService.getMembersByOrganization(id);
    }

    @GetMapping("/public")
    public List<Organization> getPublicOrganizations() {
        return organizationService.getAll();
    }

    /**
     * Dashboard statistics for the authenticated user's org.
     * Aggregates: members, elections (total/active), votes, polls.
     */
    @GetMapping("/dashboard/stats")
    public DashboardStatsResponse getDashboardStats() {
        Long orgId = SecurityUtils.getCurrentOrganizationId();
        long totalMembers    = userRepository.countByOrganizationId(orgId);
        List<Election> elections = electionRepository.findByOrganizationId(orgId);
        long totalElections  = elections.size();
        long activeElections = elections.stream().filter(Election::isActive).count();
        long totalVotes      = voteRepository.countByOrganizationId(orgId);
        long totalPolls      = pollRepository.countByOrganizationId(orgId);
        return new DashboardStatsResponse(totalMembers, totalElections, activeElections, totalVotes, totalPolls);
    }
}
