package com.cloudnative.voting.repository;

import com.cloudnative.voting.model.Poll;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PollRepository extends JpaRepository<Poll, Long> {

    List<Poll> findByOrganizationId(Long organizationId);

    List<Poll> findByOrganizationIdAndActive(Long organizationId, boolean active);

    long countByOrganizationId(Long organizationId);
}
