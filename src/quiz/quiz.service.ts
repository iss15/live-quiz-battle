import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { User } from '../users/entities/user.entity';
import { RankingUpdateDto } from 'src/sse/dtos/ranking-updates.dto';
import { Question } from './entities/question.entity';
import { SseService } from 'src/sse/sse.service';

@Injectable()
export class QuizService { 
  constructor(
    @InjectRepository(Quiz)
    private quizRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    private readonly sseService: SseService, // Inject SSE service
  ) {}


  async create(createQuizDto: CreateQuizDto, user: User): Promise<Quiz> {
    const quiz = this.quizRepository.create({
      ...createQuizDto,
      creator: user,
    });
    return this.quizRepository.save(quiz);
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizRepository.find({ relations: ['creator'] });
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepository.findOne({ 
      where: { id },
      relations: ['creator', 'questions', 'scores'] 
    });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return quiz;
}

  async update(id: string, updateQuizDto: UpdateQuizDto): Promise<Quiz> {
    const quiz = await this.findOne(id);
    const updatedQuiz = this.quizRepository.merge(quiz, updateQuizDto);
    return this.quizRepository.save(updatedQuiz);
  }

  async remove(id: string): Promise<void> {
    const result = await this.quizRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
  }

  async updateQuizRankings(quizId: string, rankings: RankingUpdateDto): Promise<void> {
    // Broadcast the ranking update to all connected clients
    this.sseService.sendRankingUpdate(quizId, rankings);
/*
    // Optionally, you can also save the rankings to the database if needed
    const quiz = await this.quizRepository.findOne({ where: { id: quizId }, relations: ['scores'] });
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }
    // Update scores based on the rankings
    quiz.scores = rankings.rankings.map(ranking => ({
      userId: ranking.userId,
      score: ranking.score,
      position: ranking.position,
    }));
    await this.quizRepository.save(quiz);*/
  }
}