package com.LearnTrack.skilltrack_backend.service;

import com.LearnTrack.skilltrack_backend.entity.Notification;
import com.LearnTrack.skilltrack_backend.repository.NotitficationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotitficationRepository notitficationRepository;

    public void createNotification(Long employeeId, String message) {
        Notification n = new Notification();
        n.setEmployeeId(employeeId);
        n.setMessage(message);
        notitficationRepository.save(n);
    }

    public List<Notification> getNotification(Long employeeId){
       return notitficationRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

}
