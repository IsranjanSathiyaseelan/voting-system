package com.cloudnative.voting.config;

import com.cloudnative.voting.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT filter that:
 *   1. Extracts the Bearer token from the Authorization header.
 *   2. Validates the token.
 *   3. Sets the Security Context with username, role, organizationId, email.
 *
 * After this filter runs, any controller can call SecurityContextHolder.getContext()
 * .getAuthentication().getPrincipal() to get the TenantUserDetails.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            if (jwtService.isValid(token)) {
                String username     = jwtService.extractUsername(token);
                String role         = jwtService.extractRole(token);
                Long   organizationId = jwtService.extractOrganizationId(token);
                String email        = jwtService.extractEmail(token);

                String authority = "ROLE_" + (role != null ? role : "VOTER");

                // Store all tenant context inside a custom principal
                TenantUserDetails principal = new TenantUserDetails(username, organizationId, role, email);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                List.of(new SimpleGrantedAuthority(authority)));

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}
