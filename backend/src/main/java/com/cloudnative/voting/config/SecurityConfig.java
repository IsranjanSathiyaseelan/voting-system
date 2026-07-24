package com.cloudnative.voting.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Allow preflight CORS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Public auth endpoints
                .requestMatchers(
                        "/api/auth/login",
                        "/api/users/register",
                        "/api/users/forgot-password",
                        "/api/users/reset-password"
                ).permitAll()

                // Swagger UI and OpenAPI docs
                .requestMatchers(
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/v3/api-docs.yaml"
                ).permitAll()

                            .requestMatchers(
                                    HttpMethod.GET,
                                    "/api/organizations/public"
                            ).permitAll()

                // Actuator: health/info public, metrics require auth
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/actuator/**").authenticated()

                // Deprecated admin login (kept for backward compat, will 401 without DB user)
//                    .requestMatchers(HttpMethod.POST, "/api/admin/register").permitAll()
//                    .requestMatchers("/api/admin/login").permitAll()

                // Organizations — all authenticated, write restricted by role
                .requestMatchers(HttpMethod.GET,    "/api/organizations/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/organizations/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/organizations/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/organizations/**").hasRole("ORGANIZATION_ADMIN")

                // Elections
                .requestMatchers(HttpMethod.GET,    "/api/elections/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/elections/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/elections/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/elections/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                // Candidates
                .requestMatchers(HttpMethod.GET,    "/api/candidates/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/candidates/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/candidates/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                // Votes — any authenticated user
                .requestMatchers("/api/votes/**").authenticated()

                // Polls
                .requestMatchers(HttpMethod.GET,    "/api/polls/**").authenticated()
                .requestMatchers(HttpMethod.POST,   "/api/polls/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.PUT,    "/api/polls/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/polls/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                // Reports
                .requestMatchers("/api/reports/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                // User profile & member management
                .requestMatchers("/api/users/profile", "/api/users/change-password").authenticated()
                .requestMatchers(HttpMethod.GET,   "/api/users/members/**").hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/users/members/**").hasRole("ORGANIZATION_ADMIN")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}