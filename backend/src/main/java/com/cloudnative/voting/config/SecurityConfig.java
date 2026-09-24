package com.cloudnative.voting.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            CorsConfigurationSource corsConfigurationSource
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            System.err.println("[AUTH 401 UNAUTHORIZED] " + request.getMethod() + " " + request.getRequestURI() + " - Reason: " + authException.getMessage());
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication required or token expired\",\"path\":\"" + request.getRequestURI() + "\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            System.err.println("[AUTH 403 FORBIDDEN] " + request.getMethod() + " " + request.getRequestURI() + " - Reason: " + accessDeniedException.getMessage());
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"Access denied: insufficient permissions for this resource\",\"path\":\"" + request.getRequestURI() + "\"}");
                        })
                )

                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // CORS PREFLIGHT
                        // =========================
                        .requestMatchers(HttpMethod.OPTIONS, "/**")
                        .permitAll()

                        // =========================
                        // PUBLIC AUTH
                        // =========================
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/users/register",
                                "/api/users/forgot-password",
                                "/api/users/reset-password"
                        )
                        .permitAll()

                        // =========================
                        // SWAGGER & API DOCS
                        // =========================
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml"
                        )
                        .permitAll()

                        // =========================
                        // PUBLIC ORGANIZATIONS
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/organizations/public"
                        )
                        .permitAll()

                        // =========================
                        // ACTUATOR
                        // =========================
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/info"
                        )
                        .permitAll()

                        .requestMatchers("/actuator/**")
                        .authenticated()

                        // =========================
                        // USER PROFILE & ACCOUNT
                        // =========================
                        .requestMatchers(
                                "/api/users/profile",
                                "/api/users/change-password"
                        )
                        .authenticated()

                        // =========================
                        // MEMBERS
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/users/members",
                                "/api/users/members/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/users/members/**"
                        )
                        .hasRole("ORGANIZATION_ADMIN")

                        // =========================
                        // CANDIDATES
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/candidates",
                                "/api/candidates/**"
                        )
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/candidates",
                                "/api/candidates/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/candidates",
                                "/api/candidates/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/candidates",
                                "/api/candidates/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/candidates",
                                "/api/candidates/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        // =========================
                        // ELECTIONS
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/elections",
                                "/api/elections/**"
                        )
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/elections",
                                "/api/elections/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/elections",
                                "/api/elections/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/elections",
                                "/api/elections/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/elections",
                                "/api/elections/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        // =========================
                        // ORGANIZATIONS
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/organizations",
                                "/api/organizations/**"
                        )
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/organizations",
                                "/api/organizations/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/organizations",
                                "/api/organizations/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/organizations",
                                "/api/organizations/**"
                        )
                        .hasRole("ORGANIZATION_ADMIN")

                        // =========================
                        // VOTES
                        // =========================
                        .requestMatchers(
                                "/api/votes",
                                "/api/votes/**"
                        )
                        .authenticated()

                        // =========================
                        // POLLS
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/polls",
                                "/api/polls/**"
                        )
                        .authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/polls",
                                "/api/polls/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/polls",
                                "/api/polls/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/polls",
                                "/api/polls/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/polls",
                                "/api/polls/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        // =========================
                        // REPORTS
                        // =========================
                        .requestMatchers(
                                "/api/reports",
                                "/api/reports/**"
                        )
                        .hasAnyRole("ORGANIZATION_ADMIN", "ELECTION_MANAGER")

                        // =========================
                        // DEFAULT
                        // =========================
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}

