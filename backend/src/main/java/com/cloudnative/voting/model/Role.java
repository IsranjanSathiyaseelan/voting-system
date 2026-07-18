package com.cloudnative.voting.model;

/**
 * User roles in the multi-tenant VoteSecure platform.
 * - ORGANIZATION_ADMIN: Owner/admin of an organization (created with the org).
 * - ELECTION_MANAGER: Can manage elections and candidates within their org.
 * - VOTER: Standard member who can vote in elections.
 *
 * NOTE: SUPER_ADMIN is removed. There is no global admin. Each organization is self-managed.
 */
public enum Role {
    ORGANIZATION_ADMIN,
    ELECTION_MANAGER,
    VOTER
}
