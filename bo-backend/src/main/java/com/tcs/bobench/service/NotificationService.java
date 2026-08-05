package com.tcs.bobench.service;

import com.tcs.bobench.entity.Notification;
import com.tcs.bobench.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public List<Notification> findAll() {
        return repository.findAll();
    }

    public Optional<Notification> findById(Long id) {
        return repository.findById(id);
    }

    public Notification save(Notification notification) {
        return repository.save(notification);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
