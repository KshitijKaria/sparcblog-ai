import { BlogDraft } from './blog-draft.model';

export interface StatsResponse {
  totalDrafts: number;
  draftsByStatus: { [key: string]: number };
  articlesThisWeek: number;
  sourcesCount: number;
  recentDrafts: BlogDraft[];
}
