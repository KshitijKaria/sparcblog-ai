package com.sparcblog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sparcblog.config.ClaudeApiConfig;
import com.sparcblog.model.BlogDraft;
import com.sparcblog.model.RawArticle;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ClaudeContentService {

    private static final Logger log = LoggerFactory.getLogger(ClaudeContentService.class);
    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s";

    private final ClaudeApiConfig config;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public ClaudeContentService(ClaudeApiConfig config, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.config = config;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public BlogDraft generateDraft(List<RawArticle> articles, String targetVertical) {
        String systemPrompt = buildSystemPrompt(targetVertical);
        String userPrompt = buildUserPrompt(articles);

        log.info("Calling Gemini API to generate blog draft for vertical: {}", targetVertical);

        String url = String.format(GEMINI_API_URL, config.getModel(), config.getApiKey());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))
                ),
                "contents", List.of(
                        Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))
                ),
                "generationConfig", Map.of(
                        "maxOutputTokens", config.getMaxTokens(),
                        "temperature", 0.7
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, request, String.class);

            JsonNode responseJson = objectMapper.readTree(response.getBody());
            String content = responseJson
                    .get("candidates").get(0)
                    .get("content")
                    .get("parts").get(0)
                    .get("text").asText();

            // Extract JSON from the response — handle markdown code blocks
            String jsonContent = content.trim();
            if (jsonContent.contains("```json")) {
                int start = jsonContent.indexOf("```json") + 7;
                int end = jsonContent.indexOf("```", start);
                jsonContent = end > start ? jsonContent.substring(start, end) : jsonContent.substring(start);
            } else if (jsonContent.contains("```")) {
                int start = jsonContent.indexOf("```") + 3;
                int end = jsonContent.indexOf("```", start);
                jsonContent = end > start ? jsonContent.substring(start, end) : jsonContent.substring(start);
            }
            // If no code blocks, try to extract JSON object directly
            if (!jsonContent.trim().startsWith("{")) {
                int braceStart = jsonContent.indexOf("{");
                if (braceStart >= 0) {
                    jsonContent = jsonContent.substring(braceStart);
                }
            }
            jsonContent = jsonContent.trim();

            JsonNode draftJson = objectMapper.readTree(jsonContent);

            BlogDraft draft = new BlogDraft();
            draft.setTitle(draftJson.get("title").asText());
            draft.setBody(draftJson.get("body").asText());
            draft.setMetaDescription(draftJson.get("metaDescription").asText());
            draft.setTargetVertical(targetVertical != null ? targetVertical : "GENERAL");
            draft.setSourceArticleIds(articles.stream().map(RawArticle::getId).toList());

            if (draftJson.has("tags")) {
                List<String> tags = new java.util.ArrayList<>();
                draftJson.get("tags").forEach(tag -> tags.add(tag.asText()));
                draft.setTags(tags);
            }

            log.info("Successfully generated draft: {}", draft.getTitle());
            return draft;

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate blog draft: " + e.getMessage(), e);
        }
    }

    private String buildSystemPrompt(String targetVertical) {
        return """
                You are a senior content writer for SparcPay, a B2B fintech company that provides end-to-end accounts payable automation software. SparcPay helps property management companies, corporations, non-profits, accounting firms, and hospitality businesses eliminate paper checks, automate invoice approvals, and make digital payments.

                SparcPay's key value propositions:
                - Eliminates check fraud exposure and data entry errors
                - Automates the entire AP cycle: digital bill capture → multi-level approval → electronic payment → accounting sync
                - Integrates with QuickBooks Online, QuickBooks Desktop, Xero, Yardi, RentManager, Buildium, CondoManager, NetIntegrity, Shiftsuite, ConStar
                - Transaction-based pricing starting at $1/transaction with no monthly fees
                - Registered with FINTRAC as a Money Services Business
                - Uses bank-level security and blockchain technology
                - Available in the US and Canada

                BRAND VOICE:
                - Professional but accessible, never stuffy
                - Open with a thought-provoking question or a bold statement about the industry pain point
                - Use concrete examples relevant to the target audience (e.g., a condo board treasurer still signing paper checks, a property manager drowning in invoices)
                - Include statistics or data points where relevant
                - Structure with clear headings and subheadings
                - Always tie back to how AP automation (and SparcPay specifically) solves the problem — but do NOT be overly salesy. Mention SparcPay naturally 2-3 times, not in every paragraph.
                - End with a call-to-action inviting readers to learn more or schedule a demo
                - Target length: 800-1200 words
                - Include a suggested meta description (under 160 characters)

                TARGET VERTICAL FOR THIS POST: %s
                """.formatted(targetVertical != null ? targetVertical : "GENERAL");
    }

    private String buildUserPrompt(List<RawArticle> articles) {
        StringBuilder sb = new StringBuilder();
        sb.append("Based on the following recent industry news, write a blog post for SparcPay's website. ");
        sb.append("The post should be inspired by the news but should NOT simply summarize the articles — ");
        sb.append("instead, use them as a jumping-off point to discuss the broader topic and how it relates to SparcPay's customers.\n\n");
        sb.append("NEWS ARTICLES:\n");

        for (int i = 0; i < articles.size(); i++) {
            RawArticle article = articles.get(i);
            sb.append(String.format("%d. Title: %s\n", i + 1, article.getTitle()));
            sb.append(String.format("   Source: %s\n", article.getSourceName()));
            sb.append(String.format("   Summary: %s\n\n", article.getSummary()));
        }

        sb.append("""
                Respond in this exact JSON format:
                {
                  "title": "Blog post title",
                  "body": "Full blog post in HTML format with <h2>, <h3>, <p>, <ul>, <li>, <strong> tags",
                  "metaDescription": "SEO meta description under 160 characters",
                  "tags": ["tag1", "tag2", "tag3"]
                }""");

        return sb.toString();
    }
}
