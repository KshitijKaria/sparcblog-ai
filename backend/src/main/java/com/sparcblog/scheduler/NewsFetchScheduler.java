package com.sparcblog.scheduler;

import com.sparcblog.service.AutoPublishService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class NewsFetchScheduler {

    private static final Logger log = LoggerFactory.getLogger(NewsFetchScheduler.class);

    private final AutoPublishService autoPublishService;

    public NewsFetchScheduler(AutoPublishService autoPublishService) {
        this.autoPublishService = autoPublishService;
    }

    @Scheduled(cron = "${news.fetch.cron}")
    public void scheduledAutoPublish() {
        log.info("Starting scheduled auto-publish pipeline...");
        autoPublishService.runFullPipeline();
    }
}
