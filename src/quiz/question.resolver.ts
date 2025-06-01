import { Args, Mutation, Query, Resolver, ID, Int, ResolveField, Parent, Context } from '@nestjs/graphql';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/graphql-auth.guard';
import { User } from '../users/entities/user.entity';
import { QuestionsService } from './question.service';

@Resolver(() => Question)
export class QuestionsResolver {
  constructor(private readonly questionsService: QuestionsService) {}

  // Query: Get all questions (protected)
  @Query(() => [Question], { name: 'questions' })
  @UseGuards(GqlAuthGuard)
  async findAll(): Promise<Question[]> {
    return this.questionsService.findAll();
  }

  // Query: Get single question by ID (protected)
  @Query(() => Question, { name: 'question' })
  @UseGuards(GqlAuthGuard)
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Question> {
    return this.questionsService.findOne(id);
  }

  // Query: Get questions by quiz ID
  @Query(() => [Question], { name: 'questionsByQuiz' })
  async findByQuiz(
    @Args('quizId', { type: () => ID }) quizId: string
  ): Promise<Question[]> {
    return this.questionsService.findByQuiz(quizId);
  }

  // Mutation: Create new question (protected)
  @Mutation(() => Question)
  @UseGuards(GqlAuthGuard)
  async createQuestion(
    @Args('input') createQuestionInput: CreateQuestionDto,
    @Context() context: any
  ): Promise<Question> {
    const user = context.req.user as User;
    return this.questionsService.create(createQuestionInput, user);
  }

  // Mutation: Update question (protected)
  @Mutation(() => Question)
  @UseGuards(GqlAuthGuard)
  async updateQuestion(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateQuestionInput: UpdateQuestionDto,
    @Context() context: any
  ): Promise<Question> {
    const user = context.req.user as User;
    return this.questionsService.update(id, updateQuestionInput, user);
  }

  // Mutation: Delete question (protected)
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeQuestion(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: any
  ): Promise<boolean> {
    const user = context.req.user as User;
    await this.questionsService.remove(id, user);
    return true;
  }

  // Field resolver: Calculate remaining time percentage
  @ResolveField('timePercentage', () => Int)
  timePercentage(@Parent() question: Question): number {
    return Math.floor((question.timeLimit / 30) * 100);
  }
}