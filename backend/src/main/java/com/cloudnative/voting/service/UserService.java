package com.cloudnative.voting.service;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse registerUser(User user) {
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("USER");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole());
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid username or password.");
        }

        return new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}
