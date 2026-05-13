package com.sparcblog.controller;

import com.sparcblog.model.NewsSource;
import com.sparcblog.repository.NewsSourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sources")
public class SourceController {

    private final NewsSourceRepository sourceRepository;

    public SourceController(NewsSourceRepository sourceRepository) {
        this.sourceRepository = sourceRepository;
    }

    @GetMapping
    public List<NewsSource> getAllSources() {
        return sourceRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<NewsSource> createSource(@RequestBody NewsSource source) {
        source.setCreatedAt(LocalDateTime.now());
        source.setActive(true);
        NewsSource saved = sourceRepository.save(source);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<NewsSource> updateSource(@PathVariable String id, @RequestBody NewsSource source) {
        return sourceRepository.findById(id)
                .map(existing -> {
                    existing.setName(source.getName());
                    existing.setUrl(source.getUrl());
                    existing.setType(source.getType());
                    existing.setCategory(source.getCategory());
                    existing.setActive(source.isActive());
                    return ResponseEntity.ok(sourceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSource(@PathVariable String id) {
        if (!sourceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        sourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
