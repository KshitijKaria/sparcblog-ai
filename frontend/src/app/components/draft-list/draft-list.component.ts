import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DraftService } from '../../services/draft.service';
import { BlogDraft, DraftStatus } from '../../models/blog-draft.model';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-draft-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Blog Drafts</h2>
      </div>

      <ul class="nav nav-tabs mb-3">
        @for (tab of statusTabs; track tab) {
          <li class="nav-item">
            <a class="nav-link" [class.active]="activeTab === tab.value"
               (click)="filterByStatus(tab.value)" style="cursor:pointer">
              {{ tab.label }}
            </a>
          </li>
        }
      </ul>

      @if (loading) {
        <div class="text-center mt-5">
          <div class="spinner-border" role="status"></div>
        </div>
      } @else if (drafts.length === 0) {
        <div class="text-center mt-5 text-muted">
          <h5>No drafts found</h5>
          <p>Generate a draft from the Dashboard or News Feed.</p>
        </div>
      } @else {
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Vertical</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (draft of drafts; track draft.id) {
              <tr>
                <td>
                  <a [routerLink]="['/drafts', draft.id]" class="text-decoration-none">{{ draft.title }}</a>
                </td>
                <td>{{ draft.targetVertical }}</td>
                <td><span class="badge" [class]="getStatusBadge(draft.status)">{{ draft.status }}</span></td>
                <td>{{ draft.createdAt | date:'short' }}</td>
                <td>
                  <a [routerLink]="['/drafts', draft.id]" class="btn btn-sm btn-outline-primary me-1">Edit</a>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteDraft(draft)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item" [class.disabled]="currentPage === 0">
              <a class="page-link" (click)="loadDrafts(currentPage - 1)">Previous</a>
            </li>
            @for (p of pages; track p) {
              <li class="page-item" [class.active]="p === currentPage">
                <a class="page-link" (click)="loadDrafts(p)">{{ p + 1 }}</a>
              </li>
            }
            <li class="page-item" [class.disabled]="currentPage >= totalPages - 1">
              <a class="page-link" (click)="loadDrafts(currentPage + 1)">Next</a>
            </li>
          </ul>
        </nav>
      }
    </div>
  `
})
export class DraftListComponent implements OnInit {
  drafts: BlogDraft[] = [];
  loading = true;
  activeTab = '';
  currentPage = 0;
  totalPages = 0;
  pages: number[] = [];

  statusTabs = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'In Review', value: 'IN_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Published', value: 'PUBLISHED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  constructor(
    private draftService: DraftService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadDrafts();
  }

  filterByStatus(status: string) {
    this.activeTab = status;
    this.loadDrafts(0);
  }

  loadDrafts(page = 0) {
    this.loading = true;
    this.currentPage = page;
    this.draftService.getDrafts(page, 20, this.activeTab || undefined).subscribe({
      next: res => {
        this.drafts = res.content;
        this.totalPages = res.totalPages;
        this.pages = Array.from({ length: Math.min(res.totalPages, 10) }, (_, i) => i);
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  deleteDraft(draft: BlogDraft) {
    if (!confirm(`Delete draft "${draft.title}"?`)) return;
    this.draftService.deleteDraft(draft.id!).subscribe({
      next: () => {
        this.toast.success('Draft deleted');
        this.loadDrafts(this.currentPage);
      }
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
