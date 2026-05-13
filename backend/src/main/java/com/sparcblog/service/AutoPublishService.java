package com.sparcblog.service;

import com.sparcblog.dto.GenerateDraftRequest;
import com.sparcblog.model.BlogDraft;
import com.sparcblog.model.DraftStatus;
import com.sparcblog.model.RawArticle;
import com.sparcblog.repository.RawArticleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AutoPublishService {

    private static final Logger log = LoggerFactory.getLogger(AutoPublishService.class);

    private final NewsFetchService newsFetchService;
    private final DraftService draftService;
    private final RawArticleRepository articleRepository;
    private final WordPressPublishService wordPressPublishService;

    public AutoPublishService(NewsFetchService newsFetchService, DraftService draftService,
                              RawArticleRepository articleRepository,
                              WordPressPublishService wordPressPublishService) {
        this.newsFetchService = newsFetchService;
        this.draftService = draftService;
        this.articleRepository = articleRepository;
        this.wordPressPublishService = wordPressPublishService;
    }

    public void runFullPipeline() {
        log.info("=== AUTOPUBLISH PIPELINE STARTED ===");

        // Step 1: Fetch fresh articles
        log.info("Step 1: Fetching news articles...");
        int fetched = newsFetchService.fetchAllSources();
        log.info("Fetched {} new articles", fetched);

        // Step 2: Check if we have enough unused articles
        List<RawArticle> available = articleRepository.findByUsedForDraftFalseOrderByRelevanceScoreDesc(
                PageRequest.of(0, 3));
        if (available.size() < 2) {
            log.warn("Not enough unused articles ({}) to generate a draft. Skipping.", available.size());
            return;
        }

        // Step 3: Generate a draft
        log.info("Step 2: Generating blog draft from top {} articles...", available.size());
        try {
            GenerateDraftRequest request = new GenerateDraftRequest();
            BlogDraft draft = draftService.generateDraft(request);
            log.info("Draft generated: \"{}\"", draft.getTitle());

            // Step 4: Auto-publish internally
            log.info("Step 3: Auto-publishing draft...");
            com.sparcblog.dto.StatusUpdateRequest statusReq = new com.sparcblog.dto.StatusUpdateRequest();
            statusReq.setStatus("PUBLISHED");
            draft = draftService.updateStatus(draft.getId(), statusReq);

            // Step 5: Publish to WordPress
            if (wordPressPublishService.isConfigured()) {
                log.info("Step 4: Publishing to WordPress...");
                String wpUrl = wordPressPublishService.publish(draft);
                if (wpUrl != null) {
                    log.info("WordPress publish successful: {}", wpUrl);
                }
            } else {
                log.info("WordPress not configured — skipping WordPress publish");
            }

            log.info("=== AUTOPUBLISH COMPLETE: \"{}\" is now live ===", draft.getTitle());

        } catch (Exception e) {
            log.error("Autopublish pipeline failed: {}", e.getMessage(), e);
        }
    }
}
