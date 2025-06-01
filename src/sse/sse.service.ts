import { Injectable } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';
import { SseClient } from './interfaces/sse.-client.interface';
import { RankingUpdateDto } from './dtos/ranking-updates.dto';

@Injectable()
export class SseService {
  private clients: Map<string, SseClient[]> = new Map();
  // Simple in-memory store of user scores:
  private quizScores: Map<string, Record<string, number>> = new Map();

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
    if (!quizClients) return;

    quizClients.forEach((client) => {
      client.observer.next({
        data: update,
      });
    });
  }

  async initializeQuizRankings(quizId: string): Promise<void> {
    // Initialize empty score table
    this.quizScores.set(quizId, {});
    // Broadcast the initial/no-data ranking to connected clients
    this.sendRankingUpdate(quizId, {
      quizId,
      rankings: [],
    });
  }

  async updatePlayerScore(quizId: string, userId: string, points: number): Promise<void> {
    const scores = this.quizScores.get(quizId);
    if (!scores) return; // Might be uninitialized

    scores[userId] = (scores[userId] || 0) + points;

    const rankings = this.buildRankings(scores);
    this.sendRankingUpdate(quizId, {
      quizId,
      rankings,
    });
  }

  async getCurrentRankings(quizId: string): Promise<RankingUpdateDto['rankings']> {
    const scores = this.quizScores.get(quizId);
    if (!scores) {
      return [];
    }
    return this.buildRankings(scores);
  }

  async finalizeQuizRankings(quizId: string): Promise<void> {
    // Optional: persist final results somewhere?
    // Cleanup in-memory data
    this.quizScores.delete(quizId);
  }

  private buildRankings(scores: Record<string, number>) {
    const entries = Object.entries(scores);
    // Sort by descending points
    entries.sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
    // Return ranking in the expected format
    return entries.map(([userId, totalScore], index) => ({
      userId,
      username: userId, // or fetch from DB
      score: totalScore,
      position: index + 1,
    }));
  }
}