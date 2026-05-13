package com.sparcblog.controller;

import com.sparcblog.model.BlogDraft;
import com.sparcblog.model.DraftStatus;
import com.sparcblog.repository.BlogDraftRepository;
import com.sparcblog.service.AutoPublishService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blog")
public class BlogController {

    private final BlogDraftRepository draftRepository;
    private final AutoPublishService autoPublishService;

    public BlogController(BlogDraftRepository draftRepository, AutoPublishService autoPublishService) {
        this.draftRepository = draftRepository;
        this.autoPublishService = autoPublishService;
    }

    @GetMapping
    public List<BlogDraft> getPublishedPosts() {
        return draftRepository.findByStatusOrderByPublishedAtDesc(DraftStatus.PUBLISHED);
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogDraft> getPostBySlug(@PathVariable String slug) {
        BlogDraft post = draftRepository.findBySlug(slug);
        if (post == null || post.getStatus() != DraftStatus.PUBLISHED) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(post);
    }

    @PostMapping("/autopublish")
    public ResponseEntity<Map<String, String>> triggerAutoPublish() {
        autoPublishService.runFullPipeline();
        return ResponseEntity.ok(Map.of("message", "Auto-publish pipeline triggered"));
    }
}
