import { ChatMessage } from "./chat-message";
import { StreamMessage } from './stream-message';

export interface StreamHistory {
  streamHistoryID: string;
  streamHistoryStreamID: string;
  hostPrincipalID: string;
  videoUrl: string;
  duration: number;
  title: string;
  thumbnail: string;
  categoryName: string;
  messages: ChatMessage[];
  totalView: number;
  createdAt: string;
}
