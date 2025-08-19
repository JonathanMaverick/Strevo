import { StreamMessage } from './stream-message';

export interface Stream {
  streamId: string;
  hostPrincipalID: string;
  title: string;
  thumbnailURL: string;
  categoryName: string;
  isActive: string;
  createdAt: string;
  messages: StreamMessage[];
  viewerCount: number;
}

export interface StreamFormData {
  hostPrincipalId: string;
  title: string;
  streamCategoryId: string;
}
