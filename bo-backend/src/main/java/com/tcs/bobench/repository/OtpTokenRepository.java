package com.tcs.bobench.repository;

import com.tcs.bobench.entity.OtpPurpose;
import com.tcs.bobench.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailAndPurposeOrderByCreatedAtDesc(String email, OtpPurpose purpose);
    void deleteByEmailAndPurpose(String email, OtpPurpose purpose);
}
