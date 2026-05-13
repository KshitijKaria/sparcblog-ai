import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DraftService } from '../../services/draft.service';
import { NewsService } from '../../services/news.service';
import { BlogDraft } from '../../models/blog-draft.model';
import { RawArticle } from '../../models/raw-article.model';
import { ToastService } from '../../shared/toast.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-draft-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (loading) {
      <div class="text-center mt-5">
        <div class="spinner-border" role="status"></div>
      </div>
    } @else if (draft) {
      <div class="container-fluid mt-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h2>Edit Draft</h2>
          <span class="badge fs-6" [class]="getStatusBadge(draft.status)">{{ draft.status }}</span>
        </div>

        <div class="row">
          <div class="col-md-8">
            <div class="mb-3">
              <label class="form-label fw-bold">Title</label>
              <input type="text" class="form-control form-control-lg" [(ngModel)]="draft.title">
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">
                Meta Description
                <small class="text-muted">({{ (draft.metaDescription || '').length }}/160)</small>
              </label>
              <input type="text" class="form-control" [(ngModel)]="draft.metaDescription" maxlength="160">
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Tags</label>
              <div class="d-flex flex-wrap gap-1 mb-2">
                @for (tag of draft.tags; track tag; let i = $index) {
                  <span class="badge bg-primary">
                    {{ tag }}
                    <button type="button" class="btn-close btn-close-white ms-1" style="font-size: 0.6em"
                            (click)="removeTag(i)"></button>
                  </span>
                }
              </div>
              <div class="input-group" style="max-width: 300px">
                <input type="text" class="form-control form-control-sm" placeholder="Add tag..."
                       [(ngModel)]="newTag" (keyup.enter)="addTag()">
                <button class="btn btn-outline-secondary btn-sm" (click)="addTag()">Add</button>
              </div>
            </div>

            <div class="mb-3">
              <ul class="nav nav-tabs">
                <li class="nav-item">
                  <a class="nav-link" [class.active]="viewMode === 'edit'" (click)="viewMode = 'edit'" style="cursor:pointer">Edit</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" [class.active]="viewMode === 'preview'" (click)="viewMode = 'preview'" style="cursor:pointer">Preview</a>
                </li>
              </ul>
              @if (viewMode === 'edit') {
                <textarea class="form-control" rows="20" [(ngModel)]="draft.body" style="font-family: monospace; font-size: 0.85em;"></textarea>
              } @else {
                <div class="border p-3 bg-white" style="min-height: 400px" [innerHTML]="sanitizedBody"></div>
              }
            </div>

            <div class="d-flex gap-2 mb-4">
              <button class="btn btn-primary" (click)="saveDraft()" [disabled]="saving">
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              @if (draft.status === 'DRAFT') {
                <button class="btn btn-warning" (click)="changeStatus('IN_REVIEW')">Submit for Review</button>
              }
              @if (draft.status === 'IN_REVIEW') {
                <button class="btn btn-info" (click)="changeStatus('APPROVED')">Approve</button>
                <button class="btn btn-danger" (click)="showRejectModal = true">Reject</button>
              }
              @if (draft.status === 'APPROVED') {
                <button class="btn btn-success" (click)="changeStatus('PUBLISHED')">Publish</button>
              }
              <button class="btn btn-outline-secondary" (click)="goBack()">Back to List</button>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card">
              <div class="card-header">
                <h6 class="mb-0">Source Articles</h6>
              </div>
              <div class="card-body">
                @if (sourceArticles.length === 0) {
                  <p class="text-muted small">No linked articles</p>
                } @else {
                  @for (article of sourceArticles; track article.id) {
                    <div class="mb-3">
                      <a [href]="article.url" target="_blank" class="text-decoration-none small">{{ article.title }}</a>
                      <br>
                      <small class="text-muted">{{ article.sourceName }}</small>
                    </div>
                  }
                }
              </div>
            </div>

            @if (draft.rejectionReason) {
              <div class="card mt-3 border-danger">
                <div class="card-header bg-danger text-white">
                  <h6 class="mb-0">Rejection Reason</h6>
                </div>
                <div class="card-body">
                  <p class="mb-0">{{ draft.rejectionReason }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      @if (showRejectModal) {
        <div class="modal d-block" style="background: rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Reject Draft</h5>
                <button type="button" class="btn-close" (click)="showRejectModal = false"></button>
              </div>
              <div class="modal-body">
                <label class="form-label">Reason for rejection</label>
                <textarea class="form-control" rows="3" [(ngModel)]="rejectionReason"></textarea>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="showRejectModal = false">Cancel</button>
                <button class="btn btn-danger" (click)="rejectDraft()">Reject</button>
              </div>
            </div>
          </div>
        </div>
      }
    }
  `
})
export class DraftEditorComponent implements OnInit {
  draft: BlogDraft | null = null;
  sourceArticles: RawArticle[] = [];
  loading = true;
  saving = false;
  viewMode: 'edit' | 'preview' = 'edit';
  newTag = '';
  showRejectModal = false;
  rejectionReason = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private draftService: DraftService,
    private newsService: NewsService,
    private toast: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.draftService.getDraft(id).subscribe({
        next: draft => {
          this.draft = draft;
          this.loading = false;
          this.loadSourceArticles();
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/drafts']);
        }
      });
    }
  }

  get sanitizedBody(): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.draft?.body || '');
  }

  loadSourceArticles() {
    if (!this.draft?.sourceArticleIds?.length) return;
    for (const id of this.draft.sourceArticleIds) {
      this.newsService.getArticle(id).subscribe({
        next: article => this.sourceArticles.push(article)
      });
    }
  }

  saveDraft() {
    if (!this.draft) return;
    this.saving = true;
    this.draftService.updateDraft(this.draft.id!, {
      title: this.draft.title,
      body: this.draft.body,
      metaDescription: this.draft.metaDescription,
      tags: this.draft.tags
    }).subscribe({
      next: updated => {
        this.draft = updated;
        this.toast.success('Draft saved');
        this.saving = false;
      },
      error: () => { this.saving = false; }
    });
  }

  changeStatus(status: string) {
    if (!this.draft) return;
    this.draftService.updateStatus(this.draft.id!, { status }).subscribe({
      next: updated => {
        this.draft = updated;
        this.toast.success(`Status changed to ${status}`);
      }
    });
  }

  rejectDraft() {
    if (!this.draft) return;
    this.draftService.updateStatus(this.draft.id!, {
      status: 'REJECTED',
      rejectionReason: this.rejectionReason
    }).subscribe({
      next: updated => {
        this.draft = updated;
        this.showRejectModal = false;
        this.toast.success('Draft rejected');
      }
    });
  }

  addTag() {
    if (this.newTag.trim() && this.draft) {
      this.draft.tags.push(this.newTag.trim());
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.draft?.tags.splice(index, 1);
  }

  goBack() {
    this.router.navigate(['/drafts']);
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
