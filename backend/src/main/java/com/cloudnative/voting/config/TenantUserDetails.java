package com.cloudnative.voting.config;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.security.Principal;
import java.util.Collection;
import java.util.List;

/**
 * Immutable value object stored as the security context principal.
 * Provides all tenant-context data extracted from the JWT so controllers
 * never need an extra database round-trip just to know who is calling.
 * Implements UserDetails and Principal for full Spring Security compatibility.
 */
public class TenantUserDetails implements UserDetails, Principal {

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

    @Override
    public String getName() {
        return username;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String cleanRole = role != null ? role.trim().toUpperCase().replaceFirst("^ROLE_", "") : "VOTER";
        return List.of(
                new SimpleGrantedAuthority("ROLE_" + cleanRole),
                new SimpleGrantedAuthority(cleanRole)
        );
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public String getRole() {
        return role;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return username;
    }
}

