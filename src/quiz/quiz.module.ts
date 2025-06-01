import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { Score } from './entities/score.entity';
import { UsersModule } from '../users/users.module';
import { QuizResolver } from './quiz.resolver';
import { QuestionsResolver } from './question.resolver';
import { QuestionsService } from './question.service';
import { QuestionController } from './question.controller';
import { ScoreService } from './score.service';
import { ScoreController } from './score.controller';
import { ScoreResolver } from './score.resolver';
import { SseModule } from 'src/sse/sse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Score]),
    SseModule,
    UsersModule,
  ],
  controllers: [QuizController, QuestionController, ScoreController],
  providers: [QuizService, QuizResolver, QuestionsResolver,QuestionsService, ScoreService, ScoreResolver],
  exports: [QuizService],
})
export class QuizModule {}