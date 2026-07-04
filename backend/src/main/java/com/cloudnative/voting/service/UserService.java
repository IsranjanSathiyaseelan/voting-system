package com.cloudnative.voting.service;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse registerUser(User user) {
        User savedUser = userRepository.save(user);
        return new UserResponse(savedUser.getId(), savedUser.getUsername(), "USER");
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password."));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Invalid username or password.");
        }

        return new UserResponse(user.getId(), user.getUsername(), "USER");
    }
}
