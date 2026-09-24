package com.cloudnative.voting.repository;

import com.cloudnative.voting.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    List<Candidate> findByElection_Id(Long electionId);

    List<Candidate> findByElection_IdOrderByVoteCountDesc(Long electionId);

    @Query("SELECT c FROM Candidate c " +
           "LEFT JOIN c.organization o " +
           "LEFT JOIN c.election e " +
           "LEFT JOIN e.organization eo " +
           "WHERE o.id = :organizationId OR eo.id = :organizationId")
    List<Candidate> findByOrganizationIdOrElectionOrganizationId(@Param("organizationId") Long organizationId);

    List<Candidate> findByOrganization_Id(Long organizationId);

    List<Candidate> findByOrganization_IdOrderByVoteCountDesc(Long organizationId);

    void deleteByOrganization_Id(Long organizationId);

    void deleteByElection_Id(Long electionId);
}
