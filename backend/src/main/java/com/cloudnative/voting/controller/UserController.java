package com.cloudnative.voting.controller;

import com.cloudnative.voting.config.SecurityUtils;
import com.cloudnative.voting.dto.RegisterRequest;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.jwt.JwtService;
import com.cloudnative.voting.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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

    @GetMapping("/members")
    public List<UserResponse> listMembers(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long orgId = extractOrgId(authHeader);

        return userService.getMembersByOrganization(orgId);
    }

    @PatchMapping("/members/{memberId}/status")
    public UserResponse updateMemberStatus(
            @PathVariable Long memberId,
            @RequestParam String status,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        Long orgId = extractOrgId(authHeader);

        return userService.updateMemberStatus(
                memberId,
                status,
                orgId
        );
    }

    private Long extractOrgId(String authHeader) {
        Long orgId = SecurityUtils.getCurrentOrganizationIdOrNull();
        if (orgId != null) {
            return orgId;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Missing or invalid Authorization header"
            );
        }

        String token = authHeader.substring(7).trim();

        orgId = jwtService.extractOrganizationId(token);

        if (orgId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User has no associated organization"
            );
        }

        return orgId;
    }
}