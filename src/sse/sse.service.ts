import { Injectable, Logger } from '@nestjs/common';
import { SseClient } from './interfaces/sse.-client.interface';
import { RankingUpdateDto } from './dtos/ranking-updates.dto';
import { UsersService } from '../users/users.service'; // <-- import UsersService

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);
  private clients: Map<string, SseClient[]> = new Map();
  private quizScores: Map<string, Record<string, number>> = new Map();

  constructor(private readonly usersService: UsersService) {} // <-- inject UsersService

  addClient(quizId: string, client: SseClient): void {
    const quizClients = this.clients.get(quizId) ?? [];
    quizClients.push(client);
    this.clients.set(quizId, quizClients);
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

  async sendRankingUpdate(quizId: string, update: RankingUpdateDto): Promise<void> {
    const quizClients = this.clients.get(quizId);
    if (!quizClients) return;

    quizClients.forEach((client) => {
      client.observer.next({
        data: update,
      });
    });
  }

  async initializeQuizRankings(quizId: string): Promise<void> {
    this.quizScores.set(quizId, {});
    await this.sendRankingUpdate(quizId, {
      quizId,
      rankings: [],
    });
  }

  async updatePlayerScore(quizId: string, userId: string, points: number): Promise<void> {
    const scores = this.quizScores.get(quizId);
    if (!scores) return;

    scores[userId] = (scores[userId] || 0) + points;

    const rankings = await this.buildRankings(scores); // <-- now async
    await this.sendRankingUpdate(quizId, {
      quizId,
      rankings,
    });
  }

  async getCurrentRankings(quizId: string): Promise<RankingUpdateDto['rankings']> {
    const scores = this.quizScores.get(quizId);
    if (!scores) {
      return [];
    }
    return await this.buildRankings(scores);
  }

  async finalizeQuizRankings(quizId: string): Promise<void> {
    this.quizScores.delete(quizId);
  }

  private async buildRankings(scores: Record<string, number>) {
    const entries = Object.entries(scores);
    this.logger.log('Building rankings from scores:', entries);

    entries.sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    const rankings = await Promise.all(
      entries.map(async ([userId, totalScore], index) => {
        let username = userId;
        try {
          const user = await this.usersService.findOne(userId);
          username = user.username;
        } catch (error) {
          this.logger.warn(`Username not found for user ID ${userId}`);
        }

        return {
          userId,
          username,
          score: totalScore,
          position: index + 1,
        };
      }),
    );

    return rankings;
  }
}
