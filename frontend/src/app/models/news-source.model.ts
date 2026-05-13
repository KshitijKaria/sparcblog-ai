export interface NewsSource {
  id?: string;
  name: string;
  url: string;
  type: string;
  category: string;
  active: boolean;
  lastFetchedAt?: string;
  createdAt?: string;
}
