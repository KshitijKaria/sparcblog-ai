package com.sparcblog.service;

import com.sparcblog.dto.StatsResponse;
import com.sparcblog.model.DraftStatus;
import com.sparcblog.repository.BlogDraftRepository;
import com.sparcblog.repository.NewsSourceRepository;
import com.sparcblog.repository.RawArticleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class StatsService {

    private final BlogDraftRepository draftRepository;
    private final RawArticleRepository articleRepository;
    private final NewsSourceRepository sourceRepository;

    public StatsService(BlogDraftRepository draftRepository, RawArticleRepository articleRepository,
                        NewsSourceRepository sourceRepository) {
        this.draftRepository = draftRepository;
        this.articleRepository = articleRepository;
        this.sourceRepository = sourceRepository;
    }

    public StatsResponse getStats() {
        StatsResponse stats = new StatsResponse();
        stats.setTotalDrafts(draftRepository.count());

        Map<String, Long> byStatus = new HashMap<>();
        for (DraftStatus status : DraftStatus.values()) {
            byStatus.put(status.name(), draftRepository.countByStatus(status));
        }
        stats.setDraftsByStatus(byStatus);

        stats.setArticlesThisWeek(articleRepository.countByFetchedAtAfter(
                LocalDateTime.now().minusDays(7)));
        stats.setSourcesCount(sourceRepository.count());
        stats.setRecentDrafts(draftRepository.findTop5ByOrderByCreatedAtDesc());

        return stats;
    }
}
