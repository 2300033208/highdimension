package com.tcs.bobench.repository;

import com.tcs.bobench.entity.ChatSession;
import com.tcs.bobench.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    List<ChatSession> findByUserOrderByUpdatedAtDesc(User user);
}
