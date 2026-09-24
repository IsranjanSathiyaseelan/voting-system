package com.cloudnative.voting.config;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

/**
 * Utility that extracts the TenantUserDetails from the current Spring Security context.
 * Use this in service or controller layers to retrieve the current caller's tenant info.
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    public static TenantUserDetails getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof TenantUserDetails)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated request");
        }
        return (TenantUserDetails) auth.getPrincipal();
    }

    /** Returns the current user's organizationId, or null if they have none (no exception thrown). */
    public static Long getCurrentOrganizationIdOrNull() {
        try {
            return getCurrentUser().getOrganizationId();
        } catch (Exception e) {
            return null;
        }
    }

    public static Long getCurrentOrganizationId() {
        Long orgId = getCurrentUser().getOrganizationId();
        if (orgId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User has no associated organization");
        }
        return orgId;
    }

    /** Returns the current user's username, or null if unauthenticated. */
    public static String getCurrentUsernameOrNull() {
        try {
            return getCurrentUser().getUsername();
        } catch (Exception e) {
            return null;
        }
    }
}

