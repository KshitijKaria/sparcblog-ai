import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StatsService } from '../../services/stats.service';
import { DraftService } from '../../services/draft.service';
import { BlogService } from '../../services/blog.service';
import { StatsResponse } from '../../models/stats.model';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Dashboard</h2>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-lg" (click)="autoPublish()" [disabled]="publishing">
            {{ publishing ? 'Publishing...' : 'Auto-Publish Now' }}
          </button>
          <button class="btn btn-success btn-lg" (click)="generateDraft()" [disabled]="generating">
            {{ generating ? 'Generating...' : 'Generate New Draft' }}
          </button>
        </div>
      </div>

      @if (stats) {
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card text-white bg-primary">
              <div class="card-body">
                <h5 class="card-title">Total Drafts</h5>
                <h2>{{ stats.totalDrafts }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-warning">
              <div class="card-body">
                <h5 class="card-title">Pending Review</h5>
                <h2>{{ stats.draftsByStatus['IN_REVIEW'] || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-success">
              <div class="card-body">
                <h5 class="card-title">Published</h5>
                <h2>{{ stats.draftsByStatus['PUBLISHED'] || 0 }}</h2>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-info">
              <div class="card-body">
                <h5 class="card-title">Articles This Week</h5>
                <h2>{{ stats.articlesThisWeek }}</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Recent Drafts</h5>
          </div>
          <div class="card-body">
            @if (stats.recentDrafts.length === 0) {
              <p class="text-muted">No drafts yet. Generate your first draft!</p>
            } @else {
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Vertical</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (draft of stats.recentDrafts; track draft.id) {
                    <tr>
                      <td>{{ draft.title }}</td>
                      <td><span class="badge" [class]="getStatusBadge(draft.status)">{{ draft.status }}</span></td>
                      <td>{{ draft.targetVertical }}</td>
                      <td>{{ draft.createdAt | date:'short' }}</td>
                      <td>
                        <a [routerLink]="['/drafts', draft.id]" class="btn btn-sm btn-outline-primary">Edit</a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>
      } @else {
        <div class="text-center mt-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  stats: StatsResponse | null = null;
  generating = false;

  publishing = false;

  constructor(
    private statsService: StatsService,
    private draftService: DraftService,
    private blogService: BlogService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.statsService.getStats().subscribe({
      next: stats => this.stats = stats,
      error: () => this.toast.error('Failed to load dashboard stats')
    });
  }

  generateDraft() {
    this.generating = true;
    this.draftService.generateDraft({}).subscribe({
      next: draft => {
        this.toast.success(`Draft generated: ${draft.title}`);
        this.loadStats();
        this.generating = false;
      },
      error: () => {
        this.generating = false;
      }
    });
  }

  autoPublish() {
    this.publishing = true;
    this.blogService.triggerAutoPublish().subscribe({
      next: () => {
        this.toast.success('Auto-publish complete! Check the blog.');
        this.loadStats();
        this.publishing = false;
      },
      error: () => { this.publishing = false; }
    });
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'DRAFT': 'bg-secondary',
      'IN_REVIEW': 'bg-warning text-dark',
      'APPROVED': 'bg-info',
      'PUBLISHED': 'bg-success',
      'REJECTED': 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }
}
