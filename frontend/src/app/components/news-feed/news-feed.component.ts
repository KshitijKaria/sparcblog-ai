import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService } from '../../services/news.service';
import { DraftService } from '../../services/draft.service';
import { RawArticle } from '../../models/raw-article.model';
import { ToastService } from '../../shared/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>News Feed</h2>
        <div>
          @if (selectedIds.size > 0) {
            <button class="btn btn-success me-2" (click)="generateFromSelected()" [disabled]="generating">
              {{ generating ? 'Generating...' : 'Generate Draft from Selected (' + selectedIds.size + ')' }}
            </button>
          }
          <button class="btn btn-primary" (click)="fetchNews()" [disabled]="fetching">
            {{ fetching ? 'Fetching...' : 'Fetch New Articles' }}
          </button>
        </div>
      </div>

      <div class="card mb-3">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Category</label>
              <select class="form-select" [(ngModel)]="filterCategory" (change)="loadArticles()">
                <option value="">All Categories</option>
                <option value="FINTECH">Fintech</option>
                <option value="PAYMENTS">Payments</option>
                <option value="AP_AUTOMATION">AP Automation</option>
                <option value="PROPERTY_MANAGEMENT">Property Management</option>
                <option value="FRAUD">Fraud</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Min Relevance: {{ filterMinRelevance }}</label>
              <input type="range" class="form-range" min="0" max="1" step="0.1"
                     [(ngModel)]="filterMinRelevance" (change)="loadArticles()">
            </div>
          </div>
        </div>
      </div>

      @if (loading) {
        <div class="text-center mt-5">
          <div class="spinner-border" role="status"></div>
        </div>
      } @else if (articles.length === 0) {
        <div class="text-center mt-5 text-muted">
          <h5>No articles found</h5>
          <p>Click "Fetch New Articles" to pull the latest news.</p>
        </div>
      } @else {
        <div class="row">
          @for (article of articles; track article.id) {
            <div class="col-md-6 mb-3">
              <div class="card h-100" [class.border-success]="selectedIds.has(article.id)">
                <div class="card-body">
                  <div class="d-flex align-items-start">
                    <input type="checkbox" class="form-check-input me-2 mt-1"
                           [checked]="selectedIds.has(article.id)"
                           (change)="toggleSelect(article.id)">
                    <div class="flex-grow-1">
                      <h6 class="card-title">
                        <a [href]="article.url" target="_blank" class="text-decoration-none">{{ article.title }}</a>
                      </h6>
                      <div class="mb-2">
                        <small class="text-muted">{{ article.sourceName }} &bull; {{ article.publishedAt | date:'mediumDate' }}</small>
                        <span class="badge ms-2" [class]="getRelevanceBadge(article.relevanceScore)">
                          {{ (article.relevanceScore * 100).toFixed(0) }}%
                        </span>
                        @if (article.usedForDraft) {
                          <span class="badge bg-secondary ms-1">Used</span>
                        }
                      </div>
                      <p class="card-text small">{{ article.summary | slice:0:200 }}...</p>
                      <div>
                        @for (kw of article.matchedKeywords; track kw) {
                          <span class="badge bg-light text-dark me-1">{{ kw }}</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <nav class="mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" [class.disabled]="currentPage === 0">
              <a class="page-link" (click)="loadArticles(currentPage - 1)">Previous</a>
            </li>
            @for (p of pages; track p) {
              <li class="page-item" [class.active]="p === currentPage">
                <a class="page-link" (click)="loadArticles(p)">{{ p + 1 }}</a>
              </li>
            }
            <li class="page-item" [class.disabled]="currentPage >= totalPages - 1">
              <a class="page-link" (click)="loadArticles(currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      }
    </div>
  `
})
export class NewsFeedComponent implements OnInit {
  articles: RawArticle[] = [];
  loading = true;
  fetching = false;
  generating = false;
  selectedIds = new Set<string>();
  filterCategory = '';
  filterMinRelevance = 0;
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];

  constructor(
    private newsService: NewsService,
    private draftService: DraftService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadArticles();
  }

  loadArticles(page = 0) {
    this.loading = true;
    this.currentPage = page;
    this.newsService.getArticles(page, 20, this.filterCategory || undefined,
      this.filterMinRelevance > 0 ? this.filterMinRelevance : undefined
    ).subscribe({
      next: res => {
        this.articles = res.content;
        this.totalPages = res.totalPages;
        this.pages = Array.from({ length: Math.min(res.totalPages, 10) }, (_, i) => i);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  fetchNews() {
    this.fetching = true;
    this.newsService.fetchNews().subscribe({
      next: res => {
        this.toast.success(`Fetched ${res.articlesStored} new articles`);
        this.fetching = false;
        this.loadArticles();
      },
      error: () => { this.fetching = false; }
    });
  }

  toggleSelect(id: string) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  generateFromSelected() {
    this.generating = true;
    this.draftService.generateDraft({ articleIds: Array.from(this.selectedIds) }).subscribe({
      next: draft => {
        this.toast.success(`Draft generated: ${draft.title}`);
        this.generating = false;
        this.selectedIds.clear();
        this.router.navigate(['/drafts', draft.id]);
      },
      error: () => { this.generating = false; }
    });
  }

  getRelevanceBadge(score: number): string {
    if (score > 0.5) return 'bg-success';
    if (score >= 0.3) return 'bg-warning text-dark';
    return 'bg-secondary';
  }
}
