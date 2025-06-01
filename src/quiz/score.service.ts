import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Score } from './entities/score.entity';
import { User } from '../users/entities/user.entity';
import { Quiz } from './entities/quiz.entity';
import { CreateScoreDto } from './dto/create-score.dto';
import { QuizService } from './quiz.service';
import { RankingUpdateDto } from 'src/sse/dtos/ranking-updates.dto';

@Injectable()
export class ScoreService {
  constructor(
    @InjectRepository(Score)
    private scoresRepository: Repository<Score>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
    private quizService: QuizService
  ) {}

  async create(createScoreDto: CreateScoreDto, user: User): Promise<Score> {
    const quiz = await this.quizzesRepository.findOneBy({ id: createScoreDto.quizId });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${createScoreDto.quizId} not found`);
    }

    const score = this.scoresRepository.create({
      ...createScoreDto,
      user,
      quiz
    });

    return this.scoresRepository.save(score);
  }

  async findByUser(userId: string): Promise<Score[]> {
    return this.scoresRepository.find({
      where: { user: { id: userId } },
      relations: ['quiz'],
      order: { createdAt: 'DESC' }
    });
  }

  async findByQuiz(quizId: string): Promise<Score[]> {
    return this.scoresRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['user'],
      order: { points: 'DESC' }
    });
  }

  async updateScore(userId: string, quizId: string, points: number): Promise<void> {
    // ... existing score update logic ...
    const existingScore = await this.scoresRepository.findOne({
    where: { quiz: { id: quizId }, user: { id: userId } },
  });

    if (!existingScore) {
      throw new NotFoundException(`Score record not found for user ${userId} and quiz ${quizId}`);
    }

    // Add or set new points
    existingScore.points += points;

    // Persist the updated score
    await this.scoresRepository.save(existingScore);
    // Notify the quiz service to update rankings
    await this.quizService.updateQuizRankings(quizId, {
      quizId,
      rankings: await this.calculateRankings(quizId),
    });
    // After updating the score, calculate new rankings
    const rankings = await this.calculateRankings(quizId);
    
    // Broadcast the ranking update
    await this.quizService.updateQuizRankings(quizId, {
      quizId,
      rankings,
    });
  }

  private async calculateRankings(quizId: string): Promise<RankingUpdateDto['rankings']> {
    const scores = await this.scoresRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['user'],
      order: { points: 'DESC' },
    });

    return scores.map((score, index) => ({
      userId: score.user.id,
      username: score.user.username,
      score: score.points,
      position: index + 1,
    }));
  }

  async getLeaderboard(quizId: string): Promise<Score[]> {
    return this.scoresRepository.find({
      where: { quiz: { id: quizId } },
      relations: ['user'],
      order: { points: 'DESC', totalTime: 'ASC' }
    });
  }
}