import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawArticle, PagedResponse } from '../models/raw-article.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) {}

  getArticles(page = 0, size = 20, category?: string, minRelevance?: number): Observable<PagedResponse<RawArticle>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (category) params = params.set('category', category);
    if (minRelevance) params = params.set('minRelevance', minRelevance.toString());
    return this.http.get<PagedResponse<RawArticle>>(this.apiUrl, { params });
  }

  getArticle(id: string): Observable<RawArticle> {
    return this.http.get<RawArticle>(`${this.apiUrl}/${id}`);
  }

  fetchNews(): Observable<{ message: string; articlesStored: number }> {
    return this.http.post<{ message: string; articlesStored: number }>(`${this.apiUrl}/fetch`, {});
  }
}
