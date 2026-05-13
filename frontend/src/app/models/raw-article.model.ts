export interface RawArticle {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  summary: string;
  fullContent?: string;
  publishedAt: string;
  fetchedAt: string;
  relevanceScore: number;
  usedForDraft: boolean;
  matchedKeywords: string[];
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
