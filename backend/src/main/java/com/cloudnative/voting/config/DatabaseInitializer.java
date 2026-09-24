package com.cloudnative.voting.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Initializes database schema updates on startup that JPA ddl-auto=update does not handle.
 * Specifically drops the legacy uq_vote_user_org unique constraint so users can vote in
 * different elections within the same organization.
 */
@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // 1. Drop legacy unique constraint on (user_id, organization_id)
        try {
            jdbcTemplate.execute("ALTER TABLE vote DROP CONSTRAINT IF EXISTS uq_vote_user_org");
            logger.info("DatabaseInitializer: uq_vote_user_org constraint dropped or not present.");
        } catch (Exception e) {
            logger.warn("DatabaseInitializer: Note on dropping uq_vote_user_org constraint: {}", e.getMessage());
        }

        // 2. Back-fill organization_id for legacy Candidate rows where it is NULL
        //    but the candidate is linked to an election that has an organization.
        try {
            int updated = jdbcTemplate.update(
                "UPDATE candidate c " +
                "SET organization_id = (" +
                "    SELECT e.organization_id FROM election e WHERE e.id = c.election_id" +
                ") " +
                "WHERE c.organization_id IS NULL AND c.election_id IS NOT NULL"
            );
            if (updated > 0) {
                logger.info("DatabaseInitializer: Back-filled organization_id for {} legacy candidate row(s).", updated);
            } else {
                logger.info("DatabaseInitializer: No legacy candidate rows needed organization_id back-fill.");
            }
        } catch (Exception e) {
            logger.warn("DatabaseInitializer: Could not back-fill candidate organization_id: {}", e.getMessage());
        }
    }
}
