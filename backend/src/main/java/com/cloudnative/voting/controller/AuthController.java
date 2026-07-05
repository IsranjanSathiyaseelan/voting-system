package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.LoginResponse;
import com.cloudnative.voting.jwt.JwtService;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request) {

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        if (!user.getPassword()
                .equals(request.getPassword())) {

            throw new RuntimeException(
                    "Invalid password");
        }

        String token =
                jwtService.generateToken(
                        user.getUsername());

        return new LoginResponse(token);
    }
}