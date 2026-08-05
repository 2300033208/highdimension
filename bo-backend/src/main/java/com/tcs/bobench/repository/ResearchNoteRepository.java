package com.tcs.bobench.repository;

import com.tcs.bobench.entity.ResearchNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResearchNoteRepository extends JpaRepository<ResearchNote, Long> {
}
