package com.sparcblog.dto;

import com.sparcblog.model.BlogDraft;

import java.util.List;
import java.util.Map;

public class StatsResponse {

    private long totalDrafts;
    private Map<String, Long> draftsByStatus;
    private long articlesThisWeek;
    private long sourcesCount;
    private List<BlogDraft> recentDrafts;

    public long getTotalDrafts() { return totalDrafts; }
    public void setTotalDrafts(long totalDrafts) { this.totalDrafts = totalDrafts; }

    public Map<String, Long> getDraftsByStatus() { return draftsByStatus; }
    public void setDraftsByStatus(Map<String, Long> draftsByStatus) { this.draftsByStatus = draftsByStatus; }

    public long getArticlesThisWeek() { return articlesThisWeek; }
    public void setArticlesThisWeek(long articlesThisWeek) { this.articlesThisWeek = articlesThisWeek; }

    public long getSourcesCount() { return sourcesCount; }
    public void setSourcesCount(long sourcesCount) { this.sourcesCount = sourcesCount; }

    public List<BlogDraft> getRecentDrafts() { return recentDrafts; }
    public void setRecentDrafts(List<BlogDraft> recentDrafts) { this.recentDrafts = recentDrafts; }
}
