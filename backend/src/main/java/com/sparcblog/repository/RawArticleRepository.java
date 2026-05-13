package com.sparcblog.repository;

import com.sparcblog.model.RawArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RawArticleRepository extends MongoRepository<RawArticle, String> {
    Optional<RawArticle> findByUrl(String url);
    boolean existsByUrl(String url);

    Page<RawArticle> findByCategoryIgnoreCase(String category, Pageable pageable);

    List<RawArticle> findByUsedForDraftFalseOrderByRelevanceScoreDesc(Pageable pageable);

    long countByFetchedAtAfter(LocalDateTime date);

    Page<RawArticle> findByRelevanceScoreGreaterThanEqual(double minRelevance, Pageable pageable);
}
