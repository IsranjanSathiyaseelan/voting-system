package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.LoginResponse;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.jwt.JwtService;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
        public LoginResponse login(
                        @RequestBody LoginRequest request) {

                User user = userRepository
                                .findByUsername(request.getUsername())
                                .orElseThrow(() -> new RuntimeException("User not found"));

                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {

                        throw new RuntimeException(
                                        "Invalid password");
                }

                String token = jwtService.generateToken(
                                user.getUsername());

                UserResponse userResponse = new UserResponse(
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getRole());

                return new LoginResponse(token, userResponse);
        }
}