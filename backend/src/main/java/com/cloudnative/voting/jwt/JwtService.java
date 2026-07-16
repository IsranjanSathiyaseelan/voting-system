package com.cloudnative.voting.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * JWT service responsible for token generation and parsing.
 * All tokens carry: sub (username), role, organizationId, email.
 */
@Service
public class JwtService {

    // Default fallback; override via JWT_SECRET env var or application.properties
    @Value("${jwt.secret:votesecure-default-secret-key-must-be-at-least-256-bits!!}")
    private String secret;

    private static final long EXPIRATION_MS = 86_400_000L; // 24 hours

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /** Generate a signed JWT embedding username, role, organizationId, and email. */
    public String generateToken(String username, String role, Long organizationId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("organizationId", organizationId);
        claims.put("email", email);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    public Long extractOrganizationId(String token) {
        Object orgId = extractAllClaims(token).get("organizationId");
        if (orgId instanceof Number) {
            return ((Number) orgId).longValue();
        }
        return null;
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).get("email", String.class);
    }

    public boolean isValid(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}