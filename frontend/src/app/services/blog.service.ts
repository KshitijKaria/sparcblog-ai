import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogDraft } from '../models/blog-draft.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private apiUrl = `${environment.apiUrl}/blog`;

  constructor(private http: HttpClient) {}

  getPublishedPosts(): Observable<BlogDraft[]> {
    return this.http.get<BlogDraft[]>(this.apiUrl);
  }

  getPostBySlug(slug: string): Observable<BlogDraft> {
    return this.http.get<BlogDraft>(`${this.apiUrl}/${slug}`);
  }

  triggerAutoPublish(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/autopublish`, {});
  }
}
