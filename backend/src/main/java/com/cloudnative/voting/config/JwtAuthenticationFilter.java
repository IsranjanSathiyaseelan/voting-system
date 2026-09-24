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
            FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();

        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {

            if (!jwtService.isValid(token)) {
                System.err.println("[JWT AUTH] Invalid or expired token for request: " + request.getMethod() + " " + request.getRequestURI());
                filterChain.doFilter(request, response);
                return;
            }

            String username = jwtService.extractUsername(token);
            String role = jwtService.extractRole(token);
            Long organizationId = jwtService.extractOrganizationId(token);
            String email = jwtService.extractEmail(token);

            String cleanRole = (role != null && !role.isBlank())
                    ? role.trim().toUpperCase().replaceFirst("^ROLE_", "")
                    : "VOTER";

            TenantUserDetails principal =
                    new TenantUserDetails(
                            username,
                            organizationId,
                            cleanRole,
                            email
                    );

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println("=================================");
            System.out.println("JWT AUTHENTICATION SUCCESS");
            System.out.println("Endpoint       : " + request.getMethod() + " " + request.getRequestURI());
            System.out.println("Username       : " + username);
            System.out.println("Email          : " + email);
            System.out.println("Organization ID: " + organizationId);
            System.out.println("Role           : " + cleanRole);
            System.out.println("Authorities    : " + principal.getAuthorities());
            System.out.println("=================================");

        } catch (Exception ex) {

            System.err.println("[JWT AUTH ERROR] Authentication failed on " + request.getMethod() + " " + request.getRequestURI() + ": " + ex.getMessage());
            ex.printStackTrace();

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
