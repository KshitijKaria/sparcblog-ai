import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogDraft } from '../../models/blog-draft.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="blog-header text-center text-white py-5" style="background: linear-gradient(135deg, #1a2332 0%, #2d3e50 100%);">
      <div class="container">
        <h1 class="display-4 fw-bold"><span style="color: #28a745;">Sparc</span>Pay Blog</h1>
        <p class="lead mt-2">Insights on AP automation, payments, and fintech</p>
      </div>
    </div>

    <div class="container py-5" style="max-width: 800px;">
      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border" role="status"></div>
        </div>
      } @else if (posts.length === 0) {
        <div class="text-center py-5 text-muted">
          <h4>No posts yet</h4>
          <p>Check back soon for the latest insights.</p>
        </div>
      } @else {
        @for (post of posts; track post.id) {
          <article class="mb-5 pb-4 border-bottom">
            <a [routerLink]="['/blog', post.slug]" class="text-decoration-none">
              <h2 class="fw-bold text-dark">{{ post.title }}</h2>
            </a>
            <div class="text-muted mb-3">
              <small>{{ post.publishedAt | date:'longDate' }}</small>
              <span class="mx-2">&bull;</span>
              @for (tag of post.tags?.slice(0, 3); track tag) {
                <span class="badge bg-light text-dark me-1">{{ tag }}</span>
              }
            </div>
            <p class="text-secondary">{{ post.metaDescription }}</p>
            <a [routerLink]="['/blog', post.slug]" class="text-success fw-semibold text-decoration-none">
              Read more &rarr;
            </a>
          </article>
        }
      }
    </div>
  `
})
export class BlogListComponent implements OnInit {
  posts: BlogDraft[] = [];
  loading = true;

  constructor(private blogService: BlogService) {}

  ngOnInit() {
    this.blogService.getPublishedPosts().subscribe({
      next: posts => {
        this.posts = posts;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }
}
