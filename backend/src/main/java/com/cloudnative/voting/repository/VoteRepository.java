package com.cloudnative.voting.repository;

import com.cloudnative.voting.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUserId(Long userId);

    boolean existsByUserIdAndOrganizationId(Long userId, Long organizationId);

    java.util.List<Vote> findAllByOrderByTimestampAsc();

}
