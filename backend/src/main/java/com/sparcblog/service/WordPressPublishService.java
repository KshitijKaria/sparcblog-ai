package com.sparcblog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sparcblog.model.BlogDraft;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
public class WordPressPublishService {

    private static final Logger log = LoggerFactory.getLogger(WordPressPublishService.class);

    @Value("${wordpress.site.url:}")
    private String siteUrl;

    @Value("${wordpress.username:}")
    private String username;

    @Value("${wordpress.app.password:}")
    private String appPassword;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public WordPressPublishService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return siteUrl != null && !siteUrl.isBlank()
                && username != null && !username.isBlank()
                && appPassword != null && !appPassword.isBlank();
    }

    public String publish(BlogDraft draft) {
        if (!isConfigured()) {
            log.warn("WordPress not configured — skipping publish");
            return null;
        }

        String apiUrl = siteUrl.replaceAll("/$", "") + "/wp-json/wp/v2/posts";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String auth = Base64.getEncoder().encodeToString(
                (username + ":" + appPassword).getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + auth);

        String tagsHtml = "";
        if (draft.getTags() != null && !draft.getTags().isEmpty()) {
            tagsHtml = "<p><em>Tags: " + String.join(", ", draft.getTags()) + "</em></p>";
        }

        Map<String, Object> body = Map.of(
                "title", draft.getTitle(),
                "content", draft.getBody() + tagsHtml,
                "status", "publish",
                "excerpt", draft.getMetaDescription() != null ? draft.getMetaDescription() : ""
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, request, String.class);

            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String wpUrl = responseJson.get("link").asText();
            log.info("Published to WordPress: {}", wpUrl);
            return wpUrl;

        } catch (Exception e) {
            log.error("Failed to publish to WordPress: {}", e.getMessage(), e);
            return null;
        }
    }
}
