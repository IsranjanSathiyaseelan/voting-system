package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.dto.PollRequest;
import com.cloudnative.voting.model.Poll;
import com.cloudnative.voting.service.PollService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for Poll management.
 * All operations are scoped to the authenticated user's organization.
 * Polls are completely independent from Elections.
 */
@RestController
@RequestMapping("/api/polls")
public class PollController {

    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    @GetMapping
    public List<Poll> getAll() {
        return pollService.getByOrg(SecurityUtils.getCurrentOrganizationId());
    }

    @GetMapping("/active")
    public List<Poll> getActive() {
        return pollService.getActiveByOrg(SecurityUtils.getCurrentOrganizationId());
    }

    @GetMapping("/{id}")
    public Poll getById(@PathVariable Long id) {
        return pollService.getById(id, SecurityUtils.getCurrentOrganizationId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Poll create(@RequestBody PollRequest request) {
        return pollService.create(request, SecurityUtils.getCurrentOrganizationId());
    }

    @PutMapping("/{id}")
    public Poll update(@PathVariable Long id, @RequestBody PollRequest request) {
        return pollService.update(id, request, SecurityUtils.getCurrentOrganizationId());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        pollService.delete(id, SecurityUtils.getCurrentOrganizationId());
    }
}
