package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.ChangePasswordRequest;
import com.cloudnative.voting.dto.ForgotPasswordRequest;
import com.cloudnative.voting.dto.RegisterRequest;
import com.cloudnative.voting.dto.ResetPasswordRequest;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.jwt.JwtService;
import com.cloudnative.voting.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public UserResponse registerUser(@Valid @RequestBody RegisterRequest request) {
        return userService.registerUser(request);
    }

    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String token = userService.generatePasswordResetToken(request.getEmail());

        return Map.of(
                "message", "Password reset token generated successfully",
                "token", token
        );
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {

        userService.resetPassword(
                request.getToken(),
                request.getNewPassword()
        );

        return Map.of("message", "Password has been reset successfully");
    }

    @PutMapping("/change-password")
    public Map<String, String> changePassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequest request) {

        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        userService.changePassword(
                principal.getName(),
                request.getCurrentPassword(),
                request.getNewPassword()
        );

        return Map.of("message", "Password changed successfully");
    }

    @GetMapping("/profile")
    public UserResponse getProfile(Principal principal) {

        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        return userService.getUserProfile(principal.getName());
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(
            Principal principal,
            @RequestBody UserResponse profileUpdate) {

        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        return userService.updateUserProfile(
                principal.getName(),
                profileUpdate
        );
    }

    @GetMapping("/members")
    public List<UserResponse> listMembers(
            @RequestHeader("Authorization") String authHeader) {

        Long orgId = extractOrgId(authHeader);

        return userService.getMembersByOrganization(orgId);
    }

    @PatchMapping("/members/{memberId}/status")
    public UserResponse updateMemberStatus(
            @PathVariable Long memberId,
            @RequestParam String status,
            @RequestHeader("Authorization") String authHeader) {

        Long orgId = extractOrgId(authHeader);

        return userService.updateMemberStatus(
                memberId,
                status,
                orgId
        );
    }

    private Long extractOrgId(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing or invalid Authorization header"
            );
        }

        String token = authHeader.substring(7);

        Long orgId = jwtService.extractOrganizationId(token);

        if (orgId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User has no associated organization"
            );
        }

        return orgId;
    }
}