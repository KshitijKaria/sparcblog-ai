import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogDraft, GenerateDraftRequest, StatusUpdateRequest } from '../models/blog-draft.model';
import { PagedResponse } from '../models/raw-article.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DraftService {
  private apiUrl = `${environment.apiUrl}/drafts`;

  constructor(private http: HttpClient) {}

  generateDraft(request: GenerateDraftRequest): Observable<BlogDraft> {
    return this.http.post<BlogDraft>(`${this.apiUrl}/generate`, request);
  }

  getDrafts(page = 0, size = 20, status?: string, targetVertical?: string): Observable<PagedResponse<BlogDraft>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status) params = params.set('status', status);
    if (targetVertical) params = params.set('targetVertical', targetVertical);
    return this.http.get<PagedResponse<BlogDraft>>(this.apiUrl, { params });
  }

  getDraft(id: string): Observable<BlogDraft> {
    return this.http.get<BlogDraft>(`${this.apiUrl}/${id}`);
  }

  updateDraft(id: string, draft: Partial<BlogDraft>): Observable<BlogDraft> {
    return this.http.put<BlogDraft>(`${this.apiUrl}/${id}`, draft);
  }

  updateStatus(id: string, request: StatusUpdateRequest): Observable<BlogDraft> {
    return this.http.patch<BlogDraft>(`${this.apiUrl}/${id}/status`, request);
  }

  deleteDraft(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
