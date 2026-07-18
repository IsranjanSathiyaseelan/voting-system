package com.cloudnative.voting.service;

import com.cloudnative.voting.dto.PollRequest;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.model.Poll;
import com.cloudnative.voting.repository.OrganizationRepository;
import com.cloudnative.voting.repository.PollRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class PollService {

    /**
     * Use a static ObjectMapper instance (Jackson 2.x, available via jjwt-jackson transitive dep).
     * We avoid injecting it as a Spring bean because Spring Boot 4.x auto-configures
     * the newer tools.jackson.databind.ObjectMapper (Jackson 3.x), not the com.fasterxml one.
     */
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final PollRepository pollRepository;
    private final OrganizationRepository organizationRepository;

    public PollService(PollRepository pollRepository,
                       OrganizationRepository organizationRepository) {
        this.pollRepository = pollRepository;
        this.organizationRepository = organizationRepository;
    }

    public List<Poll> getByOrg(Long organizationId) {
        return pollRepository.findByOrganizationId(organizationId);
    }

    public List<Poll> getActiveByOrg(Long organizationId) {
        return pollRepository.findByOrganizationIdAndActive(organizationId, true);
    }

    public Poll getById(Long id, Long organizationId) {
        Poll poll = pollRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Poll not found"));
        assertBelongsToOrg(poll, organizationId);
        return poll;
    }

    public Poll create(PollRequest request, Long organizationId) {
        if (request.getQuestion() == null || request.getQuestion().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Poll question is required");
        }

        Organization org = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));

        Poll poll = new Poll();
        poll.setQuestion(request.getQuestion().trim());
        poll.setOptions(serializeOptions(request.getOptions()));
        poll.setActive(request.isActive());
        poll.setEndDate(request.getEndDate());
        poll.setCreatedAt(LocalDateTime.now());
        poll.setOrganization(org);

        return pollRepository.save(poll);
    }

    public Poll update(Long id, PollRequest request, Long organizationId) {
        Poll poll = getById(id, organizationId);

        if (request.getQuestion() != null && !request.getQuestion().isBlank()) {
            poll.setQuestion(request.getQuestion().trim());
        }
        if (request.getOptions() != null) {
            poll.setOptions(serializeOptions(request.getOptions()));
        }
        poll.setActive(request.isActive());
        poll.setEndDate(request.getEndDate());

        return pollRepository.save(poll);
    }

    public void delete(Long id, Long organizationId) {
        Poll poll = getById(id, organizationId);
        pollRepository.delete(poll);
    }

    private void assertBelongsToOrg(Poll poll, Long organizationId) {
        if (poll.getOrganization() == null || !poll.getOrganization().getId().equals(organizationId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Poll does not belong to your organization");
        }
    }

    private String serializeOptions(List<String> options) {
        if (options == null || options.isEmpty()) return "[]";
        try {
            return OBJECT_MAPPER.writeValueAsString(options);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid options format");
        }
    }
}
