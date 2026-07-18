package com.cloudnative.voting.repository;

import com.cloudnative.voting.model.Election;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ElectionRepository extends JpaRepository<Election, Long> {

    List<Election> findByOrganizationId(Long organizationId);

    List<Election> findByOrganizationIdAndActive(Long organizationId, boolean active);
}
