package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.UserResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String ADMIN_USERNAME = "admin";
    private static final String ADMIN_PASSWORD = "admin123";

    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest request) {
        if (ADMIN_USERNAME.equals(request.getUsername())
                && ADMIN_PASSWORD.equals(request.getPassword())) {
            return new UserResponse(-1L, "admin", "admin@votesecure.local", "ADMIN");
        }

        throw new RuntimeException("Invalid admin credentials");
    }
}
