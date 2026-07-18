package com.cloudnative.voting.repository;

import com.cloudnative.voting.model.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRepository extends JpaRepository<Candidate, Long> {

    List<Candidate> findByElection_Id(Long electionId);

    List<Candidate> findByElection_IdOrderByVoteCountDesc(Long electionId);

    List<Candidate> findByOrganization_Id(Long organizationId);

    List<Candidate> findByOrganization_IdOrderByVoteCountDesc(Long organizationId);

    void deleteByOrganization_Id(Long organizationId);

    void deleteByElection_Id(Long electionId);
}
