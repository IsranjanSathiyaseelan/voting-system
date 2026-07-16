package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.LoginResponse;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.jwt.JwtService;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

/**
 * Primary authentication controller.
 * Issues a JWT embedding: username (sub), role, organizationId, email.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        }

        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;

        // Token carries all claims needed for tenant-aware authorization
        String token = jwtService.generateToken(
                user.getUsername(),
                user.getRole().name(),
                orgId,
                user.getEmail()
        );

        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                orgId,
                user.getFirstName(),
                user.getLastName(),
                user.getPhone()
        );
        userResponse.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        userResponse.setCreatedAt(user.getCreatedAt());

        return new LoginResponse(token, userResponse);
    }
}