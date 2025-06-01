import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { Quiz } from './entities/quiz.entity';
import { User } from '../users/entities/user.entity';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(Quiz)
    private quizzesRepository: Repository<Quiz>,
  ) {}

  async findAll(): Promise<Question[]> {
    return this.questionsRepository.find({ relations: ['quiz'] });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['quiz', 'quiz.creator'],
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }

  async findByQuiz(quizId: string): Promise<Question[]> {
    return this.questionsRepository.find({
      where: { quiz: { id: quizId } },
      order: { createdAt: 'ASC' },
    });
  }

  async create(
    createQuestionInput: CreateQuestionDto,
    user: User
  ): Promise<Question> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id: createQuestionInput.quizId },
      relations: ['creator'],
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${createQuestionInput.quizId} not found`);
    }

    if (quiz.creator.id !== user.id) {
      throw new ForbiddenException('You can only add questions to your own quizzes');
    }

    const question = this.questionsRepository.create({
      ...createQuestionInput,
      quiz,
    });

    return this.questionsRepository.save(question);
  }

  async update(
    id: string,
    updateQuestionInput: UpdateQuestionDto,
    user: User
  ): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['quiz', 'quiz.creator'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    if (question.quiz.creator.id !== user.id) {
      throw new ForbiddenException('You can only update questions in your own quizzes');
    }

    const updatedQuestion = this.questionsRepository.merge(
      question,
      updateQuestionInput
    );

    return this.questionsRepository.save(updatedQuestion);
  }

  async remove(id: string, user: User): Promise<void> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['quiz', 'quiz.creator'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    if (question.quiz.creator.id !== user.id) {
      throw new ForbiddenException('You can only delete questions from your own quizzes');
    }

    await this.questionsRepository.remove(question);
  }
}