package com.cloudnative.voting.repository;

import com.cloudnative.voting.model.Vote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VoteRepository extends JpaRepository<Vote, Long> {

    boolean existsByUserId(Long userId);

    boolean existsByUserIdAndOrganizationId(Long userId, Long organizationId);

    boolean existsByUserIdAndElectionId(Long userId, Long electionId);

    long countByOrganizationId(Long organizationId);

    long countByElectionId(Long electionId);

    List<Vote> findByElectionId(Long electionId);

    List<Vote> findByOrganizationId(Long organizationId);

    List<Vote> findAllByOrderByTimestampAsc();

    @Query("SELECT v FROM Vote v WHERE v.organizationId = :orgId ORDER BY v.timestamp ASC")
    List<Vote> findByOrganizationIdOrderByTimestampAsc(Long orgId);
}
