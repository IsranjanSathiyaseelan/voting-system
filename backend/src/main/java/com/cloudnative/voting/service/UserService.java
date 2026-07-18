package com.cloudnative.voting.service;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.RegisterRequest;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.model.Organization;
import com.cloudnative.voting.model.Role;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.model.UserStatus;
import com.cloudnative.voting.repository.OrganizationRepository;
import com.cloudnative.voting.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user.
     * - If newOrganizationName is provided: create new org, assign ORGANIZATION_ADMIN.
     * - If organizationId is provided: join existing org as VOTER.
     * - Neither provided: register as standalone VOTER with no org.
     */
    public UserResponse registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is already taken");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(LocalDateTime.now());

        if (request.getNewOrganizationName() != null && !request.getNewOrganizationName().isBlank()) {
            // Create a brand-new organization; registering user becomes its ORGANIZATION_ADMIN (owner)
            Organization org = new Organization();
            org.setName(request.getNewOrganizationName().trim());
            org.setDescription("Created by " + request.getUsername());
            org = organizationRepository.save(org);
            user.setOrganization(org);
            user.setRole(Role.ORGANIZATION_ADMIN);
        } else if (request.getOrganizationId() != null) {
            // Join an existing organization as a VOTER
            Organization org = organizationRepository.findById(request.getOrganizationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Organization not found"));
            user.setOrganization(org);
            user.setRole(Role.VOTER);
        } else {
            // No org specified
            user.setRole(Role.VOTER);
        }

        User savedUser = userRepository.save(user);
        return convertToResponse(savedUser);
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password.");
        }

        return convertToResponse(user);
    }

    public String generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account associated with this email."));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        return token;
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired password reset token."));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password reset token has expired.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password does not match.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return convertToResponse(user);
    }

    public UserResponse updateUserProfile(String username, UserResponse profileUpdate) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setFirstName(profileUpdate.getFirstName());
        user.setLastName(profileUpdate.getLastName());
        user.setPhone(profileUpdate.getPhone());

        if (profileUpdate.getEmail() != null && !profileUpdate.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(profileUpdate.getEmail()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already taken");
            }
            user.setEmail(profileUpdate.getEmail());
        }

        User updatedUser = userRepository.save(user);
        return convertToResponse(updatedUser);
    }

    /** List all members belonging to a given organization (tenant-scoped). */
    public List<UserResponse> getMembersByOrganization(Long organizationId) {
        return userRepository.findByOrganizationId(organizationId)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /** Update a member's status within the same organization. */
    public UserResponse updateMemberStatus(Long memberId, String newStatus, Long callerOrgId) {
        User user = userRepository.findById(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

        if (user.getOrganization() == null || !user.getOrganization().getId().equals(callerOrgId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot manage members from another organization");
        }

        try {
            user.setStatus(UserStatus.valueOf(newStatus.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status: " + newStatus);
        }

        return convertToResponse(userRepository.save(user));
    }

    private UserResponse convertToResponse(User user) {
        Long orgId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        UserResponse response = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                orgId,
                user.getFirstName(),
                user.getLastName(),
                user.getPhone()
        );
        response.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
