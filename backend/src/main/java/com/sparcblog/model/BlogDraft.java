package com.sparcblog.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "blog_drafts")
public class BlogDraft {

    @Id
    private String id;
    private String title;
    private String slug;
    private String body;
    private String metaDescription;
    private String targetVertical;
    private List<String> sourceArticleIds;
    private List<String> tags;
    private DraftStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    public BlogDraft() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.status = DraftStatus.DRAFT;
        this.sourceArticleIds = new ArrayList<>();
        this.tags = new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) {
        this.title = title;
        this.slug = generateSlug(title);
    }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    private static String generateSlug(String title) {
        if (title == null) return null;
        return title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getMetaDescription() { return metaDescription; }
    public void setMetaDescription(String metaDescription) { this.metaDescription = metaDescription; }

    public String getTargetVertical() { return targetVertical; }
    public void setTargetVertical(String targetVertical) { this.targetVertical = targetVertical; }

    public List<String> getSourceArticleIds() { return sourceArticleIds; }
    public void setSourceArticleIds(List<String> sourceArticleIds) { this.sourceArticleIds = sourceArticleIds; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public DraftStatus getStatus() { return status; }
    public void setStatus(DraftStatus status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getPublishedAt() { return publishedAt; }
    public void setPublishedAt(LocalDateTime publishedAt) { this.publishedAt = publishedAt; }
}
