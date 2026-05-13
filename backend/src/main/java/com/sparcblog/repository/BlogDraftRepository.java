package com.sparcblog.repository;

import com.sparcblog.model.BlogDraft;
import com.sparcblog.model.DraftStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface BlogDraftRepository extends MongoRepository<BlogDraft, String> {
    Page<BlogDraft> findByStatus(DraftStatus status, Pageable pageable);
    Page<BlogDraft> findByTargetVertical(String targetVertical, Pageable pageable);
    Page<BlogDraft> findByStatusAndTargetVertical(DraftStatus status, String targetVertical, Pageable pageable);
    long countByStatus(DraftStatus status);
    List<BlogDraft> findTop5ByOrderByCreatedAtDesc();
    List<BlogDraft> findByStatusOrderByPublishedAtDesc(DraftStatus status);
    BlogDraft findBySlug(String slug);
}
