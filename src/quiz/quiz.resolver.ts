import { Args, Mutation, Query, Resolver, ID, Context } from '@nestjs/graphql';
import { Quiz } from './entities/quiz.entity';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/graphql-auth.guard';


@Resolver(() => Quiz)
@UseGuards(new GqlAuthGuard())
export class QuizResolver {
  constructor(private readonly quizService: QuizService) {}

  // Query: Get all quizzes
  @Query(() => [Quiz], { name: 'quizzes', description: 'Get all quizzes' })
  async quizzes(): Promise<Quiz[]> {
    return this.quizService.findAll();
  }

  // Query: Get a single quiz by ID
  @Query(() => Quiz, { name: 'quiz', description: 'Get a quiz by ID' })
  async getQuiz(@Args('id', { type: () => ID }) id: string): Promise<Quiz> {
    return this.quizService.findOne(id);
  }

  // Mutation: Create a new quiz
  
  @Mutation(() => Quiz)
  async createQuiz(
    @Args('input') createQuizDto: CreateQuizDto,@Context() context: any
  ): Promise<Quiz> {
    const user = context.req.user;
    return this.quizService.create(createQuizDto, user);
  }

  // Mutation: Update an existing quiz
  @Mutation(() => Quiz, { description: 'Update a quiz' })
  async updateQuiz(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz> {
    return this.quizService.update(id, updateQuizDto);
  }

  // Mutation: Delete a quiz
  @Mutation(() => Boolean, { description: 'Delete a quiz' })
  async deleteQuiz(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.quizService.remove(id);
    return true;
  }

}