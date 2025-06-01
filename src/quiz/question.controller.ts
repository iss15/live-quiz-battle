import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Patch, 
    Delete, 
    UseGuards,
    Req,
    NotFoundException,
    ForbiddenException
  } from '@nestjs/common';
  import { QuestionsService } from './question.service';
  import { CreateQuestionDto } from './dto/create-question.dto';
  import { UpdateQuestionDto } from './dto/update-question.dto';
  import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { AuthGuard } from '@nestjs/passport';
  import { Question } from './entities/question.entity';
  import { Request } from 'express';
  import { User } from '../users/entities/user.entity';
  
  @ApiTags('questions')
  @Controller('questions')
  export class QuestionController {
    constructor(private readonly questionsService: QuestionsService) {}
  
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new question' })
    @ApiResponse({ status: 201, description: 'Question created', type: Question })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Quiz not found' })
    async create(
      @Body() createQuestionDto: CreateQuestionDto,
      @Req() req: Request,
    ): Promise<Question> {
      try {
        return await this.questionsService.create(
          createQuestionDto, 
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
  
    @Get()
    @ApiOperation({ summary: 'Get all questions' })
    @ApiResponse({ status: 200, description: 'List of questions', type: [Question] })
    async findAll(): Promise<Question[]> {
      return this.questionsService.findAll();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a question by ID' })
    @ApiResponse({ status: 200, description: 'Question found', type: Question })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async findOne(@Param('id') id: string): Promise<Question> {
      return this.questionsService.findOne(id);
    }
  
    @Get('quiz/:quizId')
    @ApiOperation({ summary: 'Get all questions for a quiz' })
    @ApiResponse({ status: 200, description: 'List of questions', type: [Question] })
    async findByQuiz(@Param('quizId') quizId: string): Promise<Question[]> {
      return this.questionsService.findByQuiz(quizId);
    }
  
    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update a question' })
    @ApiResponse({ status: 200, description: 'Question updated', type: Question })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async update(
      @Param('id') id: string,
      @Body() updateQuestionDto: UpdateQuestionDto,
      @Req() req: Request,
    ): Promise<Question> {
      try {
        return await this.questionsService.update(
          id,
          updateQuestionDto,
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
  
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a question' })
    @ApiResponse({ status: 200, description: 'Question deleted' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Question not found' })
    async remove(
      @Param('id') id: string,
      @Req() req: Request,
    ): Promise<void> {
      try {
        await this.questionsService.remove(id, req.user as User);
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
  }