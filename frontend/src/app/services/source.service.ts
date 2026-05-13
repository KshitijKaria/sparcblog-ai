import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NewsSource } from '../models/news-source.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SourceService {
  private apiUrl = `${environment.apiUrl}/sources`;

  constructor(private http: HttpClient) {}

  getSources(): Observable<NewsSource[]> {
    return this.http.get<NewsSource[]>(this.apiUrl);
  }

  createSource(source: NewsSource): Observable<NewsSource> {
    return this.http.post<NewsSource>(this.apiUrl, source);
  }

  updateSource(id: string, source: NewsSource): Observable<NewsSource> {
    return this.http.put<NewsSource>(`${this.apiUrl}/${id}`, source);
  }

  deleteSource(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
