package com.sparcblog.service;

import com.sparcblog.dto.DraftUpdateRequest;
import com.sparcblog.dto.GenerateDraftRequest;
import com.sparcblog.dto.StatusUpdateRequest;
import com.sparcblog.model.BlogDraft;
import com.sparcblog.model.DraftStatus;
import com.sparcblog.model.RawArticle;
import com.sparcblog.repository.BlogDraftRepository;
import com.sparcblog.repository.RawArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DraftService {

    private static final Logger log = LoggerFactory.getLogger(DraftService.class);

    private final BlogDraftRepository draftRepository;
    private final RawArticleRepository articleRepository;
    private final ClaudeContentService claudeContentService;

    public DraftService(BlogDraftRepository draftRepository, RawArticleRepository articleRepository,
                        ClaudeContentService claudeContentService) {
        this.draftRepository = draftRepository;
        this.articleRepository = articleRepository;
        this.claudeContentService = claudeContentService;
    }

    public BlogDraft generateDraft(GenerateDraftRequest request) {
        List<RawArticle> articles;

        if (request.getArticleIds() != null && !request.getArticleIds().isEmpty()) {
            articles = articleRepository.findAllById(request.getArticleIds());
            if (articles.isEmpty()) {
                throw new IllegalArgumentException("No articles found for the provided IDs");
            }
        } else {
            articles = articleRepository.findByUsedForDraftFalseOrderByRelevanceScoreDesc(
                    PageRequest.of(0, 3));
            if (articles.isEmpty()) {
                throw new IllegalStateException("No unused articles available for draft generation");
            }
        }

        log.info("Generating draft from {} articles", articles.size());

        BlogDraft draft = claudeContentService.generateDraft(articles, request.getTargetVertical());
        draft = draftRepository.save(draft);

        for (RawArticle article : articles) {
            article.setUsedForDraft(true);
            articleRepository.save(article);
        }

        return draft;
    }

    public Page<BlogDraft> getDrafts(String status, String targetVertical, Pageable pageable) {
        if (status != null && targetVertical != null) {
            return draftRepository.findByStatusAndTargetVertical(
                    DraftStatus.valueOf(status), targetVertical, pageable);
        } else if (status != null) {
            return draftRepository.findByStatus(DraftStatus.valueOf(status), pageable);
        } else if (targetVertical != null) {
            return draftRepository.findByTargetVertical(targetVertical, pageable);
        }
        return draftRepository.findAll(pageable);
    }

    public BlogDraft getDraftById(String id) {
        return draftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found: " + id));
    }

    public BlogDraft updateDraft(String id, DraftUpdateRequest request) {
        BlogDraft draft = getDraftById(id);
        draft.setTitle(request.getTitle());
        draft.setBody(request.getBody());
        draft.setMetaDescription(request.getMetaDescription());
        draft.setTags(request.getTags());
        draft.setUpdatedAt(LocalDateTime.now());
        return draftRepository.save(draft);
    }

    public BlogDraft updateStatus(String id, StatusUpdateRequest request) {
        BlogDraft draft = getDraftById(id);
        DraftStatus newStatus = DraftStatus.valueOf(request.getStatus());
        draft.setStatus(newStatus);
        draft.setUpdatedAt(LocalDateTime.now());

        if (newStatus == DraftStatus.REJECTED) {
            draft.setRejectionReason(request.getRejectionReason());
        }
        if (newStatus == DraftStatus.PUBLISHED) {
            draft.setPublishedAt(LocalDateTime.now());
        }

        return draftRepository.save(draft);
    }

    public void deleteDraft(String id) {
        if (!draftRepository.existsById(id)) {
            throw new IllegalArgumentException("Draft not found: " + id);
        }
        draftRepository.deleteById(id);
    }
}
