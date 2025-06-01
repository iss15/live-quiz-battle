export interface SseClient {
  id: string;
  observer: any; // or type Observer<MessageEvent>
  quizId: string;
  userId?: string;
}