package com.cloudnative.voting.controller;

import com.cloudnative.voting.dto.LoginRequest;
import com.cloudnative.voting.dto.UserResponse;
import com.cloudnative.voting.model.User;
import com.cloudnative.voting.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public UserResponse registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }
}
