package com.sparcblog.dto;

import java.util.List;

public class GenerateDraftRequest {

    private String targetVertical;
    private List<String> articleIds;

    public String getTargetVertical() { return targetVertical; }
    public void setTargetVertical(String targetVertical) { this.targetVertical = targetVertical; }

    public List<String> getArticleIds() { return articleIds; }
    public void setArticleIds(List<String> articleIds) { this.articleIds = articleIds; }
}
