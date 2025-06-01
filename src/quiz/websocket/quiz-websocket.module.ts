import { Module } from '@nestjs/common';
import { QuizGateway } from './quiz.gateway';
import { QuizService } from '../quiz.service';
import { QuestionsService } from '../question.service';
import { ScoreService } from '../score.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../entities/quiz.entity';
import { Question } from '../entities/question.entity';
import { Score } from '../entities/score.entity';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { SseService } from 'src/sse/sse.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Score]),
    AuthModule,
    UsersModule,
  ],
  providers: [SseService, QuizGateway, QuizService, QuestionsService, ScoreService],
  exports: [QuizGateway],
})
export class QuizWebSocketModule {}