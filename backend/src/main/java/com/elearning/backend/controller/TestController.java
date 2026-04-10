package com.elearning.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/test")
    public String test() {
        return "Backend is working 🚀";
    }

    @GetMapping("/api/profile")
    public String profile(@AuthenticationPrincipal String email) {
        return "Connecté en tant que : " + email;
    }
}