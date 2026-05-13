import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SourceService } from '../../services/source.service';
import { NewsSource } from '../../models/news-source.model';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-source-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid mt-4">
      <h2 class="mb-4">News Sources</h2>

      <div class="card mb-4">
        <div class="card-header">
          <h6 class="mb-0">Add New Source</h6>
        </div>
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-3">
              <label class="form-label">Name</label>
              <input type="text" class="form-control" [(ngModel)]="newSource.name" placeholder="Source name">
            </div>
            <div class="col-md-4">
              <label class="form-label">URL</label>
              <input type="text" class="form-control" [(ngModel)]="newSource.url" placeholder="RSS feed URL">
            </div>
            <div class="col-md-2">
              <label class="form-label">Category</label>
              <select class="form-select" [(ngModel)]="newSource.category">
                <option value="FINTECH">Fintech</option>
                <option value="PAYMENTS">Payments</option>
                <option value="AP_AUTOMATION">AP Automation</option>
                <option value="PROPERTY_MANAGEMENT">Property Management</option>
                <option value="FRAUD">Fraud</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-success w-100" (click)="addSource()" [disabled]="!newSource.name || !newSource.url">
                Add Source
              </button>
            </div>
          </div>
        </div>
      </div>

      @if (loading) {
        <div class="text-center mt-5">
          <div class="spinner-border" role="status"></div>
        </div>
      } @else {
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>URL</th>
              <th>Category</th>
              <th>Active</th>
              <th>Last Fetched</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (source of sources; track source.id) {
              <tr>
                <td>{{ source.name }}</td>
                <td class="text-truncate" style="max-width: 250px">{{ source.url }}</td>
                <td><span class="badge bg-info">{{ source.category }}</span></td>
                <td>
                  <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" [checked]="source.active"
                           (change)="toggleActive(source)">
                  </div>
                </td>
                <td>{{ source.lastFetchedAt ? (source.lastFetchedAt | date:'short') : 'Never' }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteSource(source)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      }
    </div>
  `
})
export class SourceManagerComponent implements OnInit {
  sources: NewsSource[] = [];
  loading = true;
  newSource: NewsSource = { name: '', url: '', type: 'RSS', category: 'FINTECH', active: true };

  constructor(
    private sourceService: SourceService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadSources();
  }

  loadSources() {
    this.loading = true;
    this.sourceService.getSources().subscribe({
      next: sources => {
        this.sources = sources;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  addSource() {
    this.sourceService.createSource(this.newSource).subscribe({
      next: () => {
        this.toast.success('Source added');
        this.newSource = { name: '', url: '', type: 'RSS', category: 'FINTECH', active: true };
        this.loadSources();
      }
    });
  }

  toggleActive(source: NewsSource) {
    source.active = !source.active;
    this.sourceService.updateSource(source.id!, source).subscribe({
      next: () => this.toast.success(`${source.name} ${source.active ? 'enabled' : 'disabled'}`),
      error: () => { source.active = !source.active; }
    });
  }

  deleteSource(source: NewsSource) {
    if (!confirm(`Delete source "${source.name}"?`)) return;
    this.sourceService.deleteSource(source.id!).subscribe({
      next: () => {
        this.toast.success('Source deleted');
        this.loadSources();
      }
    });
  }
}
