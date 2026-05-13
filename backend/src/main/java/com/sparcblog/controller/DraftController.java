package com.sparcblog.controller;

import com.sparcblog.dto.DraftUpdateRequest;
import com.sparcblog.dto.GenerateDraftRequest;
import com.sparcblog.dto.StatusUpdateRequest;
import com.sparcblog.model.BlogDraft;
import com.sparcblog.service.DraftService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drafts")
public class DraftController {

    private final DraftService draftService;

    public DraftController(DraftService draftService) {
        this.draftService = draftService;
    }

    @PostMapping("/generate")
    public ResponseEntity<BlogDraft> generateDraft(@RequestBody GenerateDraftRequest request) {
        BlogDraft draft = draftService.generateDraft(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(draft);
    }

    @GetMapping
    public Page<BlogDraft> getDrafts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String targetVertical,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return draftService.getDrafts(status, targetVertical, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogDraft> getDraft(@PathVariable String id) {
        return ResponseEntity.ok(draftService.getDraftById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogDraft> updateDraft(@PathVariable String id,
                                                  @Valid @RequestBody DraftUpdateRequest request) {
        return ResponseEntity.ok(draftService.updateDraft(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BlogDraft> updateStatus(@PathVariable String id,
                                                   @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(draftService.updateStatus(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDraft(@PathVariable String id) {
        draftService.deleteDraft(id);
        return ResponseEntity.noContent().build();
    }
}
