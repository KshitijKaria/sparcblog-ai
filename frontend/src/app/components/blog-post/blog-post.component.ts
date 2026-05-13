import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogDraft } from '../../models/blog-draft.model';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (loading) {
      <div class="text-center py-5">
        <div class="spinner-border" role="status"></div>
      </div>
    } @else if (post) {
      <div class="blog-header text-white py-4" style="background: linear-gradient(135deg, #1a2332 0%, #2d3e50 100%);">
        <div class="container" style="max-width: 800px;">
          <a routerLink="/blog" class="text-white-50 text-decoration-none small">&larr; Back to Blog</a>
          <h1 class="fw-bold mt-3">{{ post.title }}</h1>
          <div class="mt-2">
            <small class="text-white-50">{{ post.publishedAt | date:'longDate' }}</small>
            @for (tag of post.tags; track tag) {
              <span class="badge bg-success ms-2">{{ tag }}</span>
            }
          </div>
        </div>
      </div>

      <div class="container py-5" style="max-width: 800px;">
        <article class="blog-content" [innerHTML]="sanitizedBody"></article>
      </div>
    } @else {
      <div class="text-center py-5">
        <h3>Post not found</h3>
        <a routerLink="/blog" class="btn btn-outline-success mt-3">Back to Blog</a>
      </div>
    }
  `,
  styles: [`
    :host ::ng-deep .blog-content h2 { margin-top: 2rem; margin-bottom: 1rem; font-weight: 700; }
    :host ::ng-deep .blog-content h3 { margin-top: 1.5rem; margin-bottom: 0.75rem; font-weight: 600; }
    :host ::ng-deep .blog-content p { line-height: 1.8; color: #374151; margin-bottom: 1.2rem; }
    :host ::ng-deep .blog-content ul { margin-bottom: 1.2rem; }
    :host ::ng-deep .blog-content li { line-height: 1.8; color: #374151; margin-bottom: 0.5rem; }
    :host ::ng-deep .blog-content strong { color: #1a2332; }
  `]
})
export class BlogPostComponent implements OnInit {
  post: BlogDraft | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private sanitizer: DomSanitizer,
    private titleService: Title,
    private metaService: Meta
  ) {}

  get sanitizedBody(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.post?.body || '');
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.blogService.getPostBySlug(slug).subscribe({
        next: post => {
          this.post = post;
          this.loading = false;
          this.titleService.setTitle(post.title + ' | SparcPay Blog');
          if (post.metaDescription) {
            this.metaService.updateTag({ name: 'description', content: post.metaDescription });
          }
        },
        error: () => {
          this.loading = false;
        }
      });
    }
  }
}
