import { Injectable } from '@nestjs/common';
import { SseClient } from './interfaces/sse.-client.interface';
import { RankingUpdateDto } from './dtos/ranking-updates.dto';

@Injectable()
export class SseService {
  private clients: Map<string, SseClient[]> = new Map();

  addClient(quizId: string, client: SseClient): void {
  let quizClients = this.clients.get(quizId);
  if (!quizClients) {
    quizClients = [];
    this.clients.set(quizId, quizClients);
  }
  quizClients.push(client);
}

  removeClient(quizId: string, clientId: string): void {
    const quizClients = this.clients.get(quizId);
    if (quizClients) {
      this.clients.set(
        quizId,
        quizClients.filter((client) => client.id !== clientId),
      );
    }
  }

  sendRankingUpdate(quizId: string, update: RankingUpdateDto): void {
  const quizClients = this.clients.get(quizId);
  if (quizClients) {
    quizClients.forEach((client) => {
      client.observer.next({
        data: update,
      } as MessageEvent);
    });
  }
}

  getClientCount(quizId: string): number {
    return this.clients.get(quizId)?.length || 0;
  }
}