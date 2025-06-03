import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Patch, 
  Delete, 
  UseGuards,
  Req 
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Quiz } from './entities/quiz.entity';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { UserRole } from 'src/users/enums/user-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(AuthGuard('jwt'), RolesGuard)

export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quiz' })
  @ApiResponse({ status: 201, description: 'Quiz created', type: Quiz })
  async create(
    @Body() createQuizDto: CreateQuizDto,
    @Req() req: Request,
  ): Promise<Quiz> {
    return this.quizService.create(createQuizDto, req.user as User);
  }

  @Get()
  @Roles(UserRole.PLAYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all quizzes' })
  @ApiResponse({ status: 200, description: 'List of quizzes', type: [Quiz] })
  async findAll(): Promise<Quiz[]> {
    return this.quizService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.PLAYER, UserRole.ADMIN)
  @ApiBearerAuth()  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get a quiz by ID' })
  @ApiResponse({ status: 200, description: 'Quiz found', type: Quiz })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async findOne(@Param('id') id: string): Promise<Quiz> {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.PLAYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz updated', type: Quiz })
  async update(
    @Param('id') id: string,
    @Body() updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz> {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @Roles(UserRole.PLAYER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quiz' })
  @ApiResponse({ status: 200, description: 'Quiz deleted' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.quizService.remove(id);
  }
}