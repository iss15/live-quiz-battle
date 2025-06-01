import { Args, Mutation, Query, Resolver, ID, Context } from '@nestjs/graphql';
import { ScoreService } from './score.service';
import { Score } from './entities/score.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/guards/graphql-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateScoreDto } from './dto/create-score.dto';

@Resolver(() => Score)
export class ScoreResolver {
  constructor(private readonly scoresService: ScoreService) {}

  @Mutation(() => Score, { description: 'Submit a new quiz score' })
  @UseGuards(GqlAuthGuard)
  async submitScore(
    @Args('input') createScoreInput: CreateScoreDto,
    @Context() context: any,
  ): Promise<Score> {
    const user = context.req.user as User;
    return this.scoresService.create(createScoreInput, user);
  }

  @Query(() => [Score], { description: 'Get all scores for current user' })
  @UseGuards(GqlAuthGuard)
  async myScores(@Context() context:any): Promise<Score[]> {
    const user = context.req.user as User;
    return this.scoresService.findByUser(user.id);
  }

  @Query(() => [Score], { description: 'Get scores by user ID' })
  async scoresByUser(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Score[]> {
    return this.scoresService.findByUser(userId);
  }

  @Query(() => [Score], { description: 'Get scores by quiz ID' })
  async scoresByQuiz(
    @Args('quizId', { type: () => ID }) quizId: string,
  ): Promise<Score[]> {
    return this.scoresService.findByQuiz(quizId);
  }

  @Query(() => [Score], { description: 'Get quiz leaderboard' })
  async leaderboard(
    @Args('quizId', { type: () => ID }) quizId: string,
  ): Promise<Score[]> {
    return this.scoresService.getLeaderboard(quizId);
  }


}