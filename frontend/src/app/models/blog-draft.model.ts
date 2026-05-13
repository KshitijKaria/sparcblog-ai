export interface BlogDraft {
  id?: string;
  title: string;
  slug?: string;
  body: string;
  metaDescription: string;
  targetVertical: string;
  sourceArticleIds: string[];
  tags: string[];
  status: DraftStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export type DraftStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED';

export interface GenerateDraftRequest {
  targetVertical?: string;
  articleIds?: string[];
}

export interface StatusUpdateRequest {
  status: string;
  rejectionReason?: string;
}
