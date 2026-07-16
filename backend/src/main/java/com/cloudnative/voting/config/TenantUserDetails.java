package com.cloudnative.voting.config;

/**
 * Immutable value object stored as the security context principal.
 * Provides all tenant-context data extracted from the JWT so controllers
 * never need an extra database round-trip just to know who is calling.
 */
public class TenantUserDetails {

    private final String username;
    private final Long organizationId;
    private final String role;
    private final String email;

    public TenantUserDetails(String username, Long organizationId, String role, String email) {
        this.username = username;
        this.organizationId = organizationId;
        this.role = role;
        this.email = email;
    }

    public String getUsername() { return username; }
    public Long getOrganizationId() { return organizationId; }
    public String getRole() { return role; }
    public String getEmail() { return email; }

    @Override
    public String toString() {
        return "TenantUserDetails{username='" + username + "', orgId=" + organizationId + ", role='" + role + "'}";
    }
}
