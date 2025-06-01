import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
    NotFoundException,
    ForbiddenException
  } from '@nestjs/common';
  import { ScoreService } from './score.service';
  import { CreateScoreDto } from './dto/create-score.dto';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { AuthGuard } from '@nestjs/passport';
  import { Score } from './entities/score.entity';
  import { Request } from 'express';
  import { User } from '../users/entities/user.entity';
  
  @ApiTags('scores')
  @Controller('scores')
  export class ScoreController {
    constructor(private readonly scoresService: ScoreService) {}
  
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit quiz score' })
    @ApiResponse({ status: 201, description: 'Score submitted', type: Score })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Quiz not found' })
    async create(
      @Body() createScoreDto: CreateScoreDto,
      @Req() req: Request,
    ): Promise<Score> {
      try {
        return await this.scoresService.create(
          createScoreDto,
          req.user as User
        );
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException(error.message);
        }
        if (error instanceof ForbiddenException) {
          throw new ForbiddenException(error.message);
        }
        throw error;
      }
    }
  
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get all scores for a user' })
    @ApiResponse({ status: 200, description: 'List of scores', type: [Score] })
    async findByUser(@Param('userId') userId: string): Promise<Score[]> {
    
      return this.scoresService.findByUser(userId);
    }
  
    @Get('quiz/:quizId')
    @ApiOperation({ summary: 'Get all scores for a quiz' })
    @ApiResponse({ status: 200, description: 'List of scores', type: [Score] })
    async findByQuiz(@Param('quizId') quizId: string): Promise<Score[]> {
      return this.scoresService.findByQuiz(quizId);
    }
  
    @Get('leaderboard/:quizId')
    @ApiOperation({ summary: 'Get quiz leaderboard' })
    @ApiResponse({ status: 200, description: 'Leaderboard data', type: [Score] })
    async getLeaderboard(@Param('quizId') quizId: string): Promise<Score[]> {
      return this.scoresService.getLeaderboard(quizId);
    }
  }