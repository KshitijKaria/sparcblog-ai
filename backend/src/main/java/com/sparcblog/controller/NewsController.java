package com.sparcblog.controller;

import com.sparcblog.model.RawArticle;
import com.sparcblog.repository.RawArticleRepository;
import com.sparcblog.service.NewsFetchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    private final RawArticleRepository articleRepository;
    private final NewsFetchService newsFetchService;

    public NewsController(RawArticleRepository articleRepository, NewsFetchService newsFetchService) {
        this.articleRepository = articleRepository;
        this.newsFetchService = newsFetchService;
    }

    @GetMapping
    public Page<RawArticle> getArticles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "0.0") double minRelevance,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "relevanceScore"));

        if (category != null && !category.isEmpty()) {
            return articleRepository.findByCategoryIgnoreCase(category, pageable);
        }
        if (minRelevance > 0.0) {
            return articleRepository.findByRelevanceScoreGreaterThanEqual(minRelevance, pageable);
        }
        return articleRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawArticle> getArticle(@PathVariable String id) {
        return articleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/fetch")
    public ResponseEntity<Map<String, Object>> fetchNews() {
        int count = newsFetchService.fetchAllSources();
        return ResponseEntity.ok(Map.of(
                "message", "Fetch complete",
                "articlesStored", count
        ));
    }
}
