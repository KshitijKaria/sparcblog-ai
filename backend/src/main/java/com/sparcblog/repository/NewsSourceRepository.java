package com.sparcblog.repository;

import com.sparcblog.model.NewsSource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NewsSourceRepository extends MongoRepository<NewsSource, String> {
    List<NewsSource> findByActiveTrue();
    long countByActiveTrue();
}
