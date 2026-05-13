package com.sparcblog.service;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import com.sparcblog.model.NewsSource;
import com.sparcblog.model.RawArticle;
import com.sparcblog.repository.NewsSourceRepository;
import com.sparcblog.repository.RawArticleRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
public class NewsFetchService {

    private static final Logger log = LoggerFactory.getLogger(NewsFetchService.class);

    private final NewsSourceRepository sourceRepository;
    private final RawArticleRepository articleRepository;

    private static final Map<String, Double> HIGH_KEYWORDS = Map.of(
            "accounts payable", 0.3,
            "ap automation", 0.3,
            "check fraud", 0.3,
            "cheque fraud", 0.3,
            "payment automation", 0.3,
            "digital payments", 0.3,
            "b2b payments", 0.3,
            "invoice automation", 0.3,
            "paperless payments", 0.3
    );

    private static final Map<String, Double> MEDIUM_KEYWORDS = Map.ofEntries(
            Map.entry("property management", 0.2),
            Map.entry("condo", 0.2),
            Map.entry("hoa", 0.2),
            Map.entry("non-profit payments", 0.2),
            Map.entry("quickbooks", 0.2),
            Map.entry("xero", 0.2),
            Map.entry("yardi", 0.2),
            Map.entry("vendor payments", 0.2),
            Map.entry("payment processing", 0.2),
            Map.entry("ach", 0.2),
            Map.entry("direct deposit", 0.2)
    );

    private static final Map<String, Double> LOW_KEYWORDS = Map.ofEntries(
            Map.entry("fintech", 0.1),
            Map.entry("regtech", 0.1),
            Map.entry("fintrac", 0.1),
            Map.entry("payment fraud", 0.1),
            Map.entry("real estate tech", 0.1),
            Map.entry("proptech", 0.1),
            Map.entry("accounting software", 0.1),
            Map.entry("erp integration", 0.1),
            Map.entry("blockchain payments", 0.1)
    );

    public NewsFetchService(NewsSourceRepository sourceRepository, RawArticleRepository articleRepository) {
        this.sourceRepository = sourceRepository;
        this.articleRepository = articleRepository;
    }

    @PostConstruct
    public void seedDefaultSources() {
        if (sourceRepository.count() == 0) {
            log.info("Seeding default news sources...");
            List<NewsSource> defaults = List.of(
                    createSource("Payments Dive", "https://www.paymentsdive.com/feeds/news/", "RSS", "PAYMENTS"),
                    createSource("Finextra", "https://www.finextra.com/rss/headlines.aspx", "RSS", "FINTECH"),
                    createSource("PYMNTS", "https://www.pymnts.com/feed/", "RSS", "PAYMENTS"),
                    createSource("AccountingToday", "https://feeds.arizent.com/accounting-today", "RSS", "AP_AUTOMATION"),
                    createSource("The Paypers", "https://thepaypers.com/rss", "RSS", "PAYMENTS")
            );
            sourceRepository.saveAll(defaults);
            log.info("Seeded {} default news sources", defaults.size());
        }
    }

    private NewsSource createSource(String name, String url, String type, String category) {
        NewsSource source = new NewsSource();
        source.setName(name);
        source.setUrl(url);
        source.setType(type);
        source.setCategory(category);
        return source;
    }

    public int fetchAllSources() {
        List<NewsSource> activeSources = sourceRepository.findByActiveTrue();
        int totalStored = 0;

        for (NewsSource source : activeSources) {
            try {
                int count = fetchFromSource(source);
                totalStored += count;
                source.setLastFetchedAt(LocalDateTime.now());
                sourceRepository.save(source);
                log.info("Fetched {} articles from {}", count, source.getName());
            } catch (Exception e) {
                log.error("Error fetching from source {}: {}", source.getName(), e.getMessage());
            }
        }

        log.info("Total articles fetched and stored: {}", totalStored);
        return totalStored;
    }

    private int fetchFromSource(NewsSource source) throws Exception {
        SyndFeedInput input = new SyndFeedInput();
        SyndFeed feed = input.build(new XmlReader(URI.create(source.getUrl()).toURL()));
        int stored = 0;

        for (SyndEntry entry : feed.getEntries()) {
            String articleUrl = entry.getLink();
            if (articleUrl == null || articleRepository.existsByUrl(articleUrl)) {
                continue;
            }

            String title = entry.getTitle() != null ? entry.getTitle() : "";
            String description = entry.getDescription() != null ? entry.getDescription().getValue() : "";
            String textContent = (title + " " + description).toLowerCase();

            List<String> matchedKeywords = new ArrayList<>();
            double score = 0.0;

            score += scoreKeywords(textContent, HIGH_KEYWORDS, matchedKeywords);
            score += scoreKeywords(textContent, MEDIUM_KEYWORDS, matchedKeywords);
            score += scoreKeywords(textContent, LOW_KEYWORDS, matchedKeywords);

            score = Math.min(score, 1.0);

            if (score < 0.1) {
                continue;
            }

            RawArticle article = new RawArticle();
            article.setSourceId(source.getId());
            article.setSourceName(source.getName());
            article.setCategory(source.getCategory());
            article.setTitle(title);
            article.setUrl(articleUrl);
            article.setSummary(description.length() > 500 ? description.substring(0, 500) : description);
            article.setFullContent(description);
            article.setRelevanceScore(score);
            article.setMatchedKeywords(matchedKeywords);

            if (entry.getPublishedDate() != null) {
                article.setPublishedAt(entry.getPublishedDate().toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDateTime());
            } else {
                article.setPublishedAt(LocalDateTime.now());
            }

            articleRepository.save(article);
            stored++;
        }

        return stored;
    }

    private double scoreKeywords(String text, Map<String, Double> keywords, List<String> matched) {
        double score = 0.0;
        for (Map.Entry<String, Double> entry : keywords.entrySet()) {
            if (text.contains(entry.getKey())) {
                score += entry.getValue();
                matched.add(entry.getKey());
            }
        }
        return score;
    }
}
