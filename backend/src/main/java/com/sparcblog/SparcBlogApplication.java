package com.sparcblog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SparcBlogApplication {

    public static void main(String[] args) {
        SpringApplication.run(SparcBlogApplication.class, args);
    }
}
