package com.LearnTrack.skilltrack_backend.controller;

import com.LearnTrack.skilltrack_backend.entity.Notification;
import com.LearnTrack.skilltrack_backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService service;

    @GetMapping("/{employeeId}")
    public List<Notification> getNotifications(@PathVariable Long employeeId) {
        return service.getNotification(employeeId);
    }
}