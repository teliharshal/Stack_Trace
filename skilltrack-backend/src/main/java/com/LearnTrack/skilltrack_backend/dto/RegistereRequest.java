package com.LearnTrack.skilltrack_backend.dto;

import lombok.Data;

@Data
public class RegistereRequest {

    private String password;
    private String confirmPassword;
    private String token;

    public String getPassword() {
        return password;
    }

    public String getToken() {
        return token;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
}
