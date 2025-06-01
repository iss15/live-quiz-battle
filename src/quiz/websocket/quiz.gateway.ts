import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { QuizService } from '../quiz.service';
import { QuestionsService } from '../question.service';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';
import { User } from '../../users/entities/user.entity';
import { SseService } from '../../sse/sse.service';
import { Question } from '../entities/question.entity';

@WebSocketGateway({
  namespace: '/quiz',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class QuizGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('QuizGateway');
  private activeQuizzes: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly quizService: QuizService,
    private readonly questionsService: QuestionsService,
    private readonly sseService: SseService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connection', 'Successfully connected to quiz gateway');
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    const quizId = client.data.quizId;
    if (quizId) {
      client.leave(quizId);
      this.server.to(quizId).emit('player-left', {
        userId: client.data.user.id,
        username: client.data.user.username,
      });
      
      // Check if room is empty and clean up
      const room = this.server.sockets.adapter.rooms.get(quizId);
      if (!room || room.size === 0) {
        this.cleanupQuiz(quizId);
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-quiz')
  async handleJoinQuiz(client: Socket, payload: { quizId: string }) {
    const user = client.data.user as User;
    const quizId = payload.quizId;

    if (!quizId) {
      client.emit('error', 'Quiz ID is required');
      return;
    }

    try {
      const quiz = await this.quizService.findOne(quizId);
      if (!quiz) {
        client.emit('error', 'Quiz not found');
        return;
      }

      // Store quiz and user data on the client
      client.data.quizId = quizId;
      client.data.user = user;

      // Join the quiz room
      client.join(quizId);

      this.logger.log(`User ${user.username} joined quiz ${quizId}`);
      client.emit('joined-quiz', { 
        quiz: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description, 
          creatorId: quiz.creator.id,
        },
        user 
      });

      // Notify other players
      this.server.to(quizId).emit('player-joined', {
        userId: user.id,
        username: user.username,
      });

      // Send current room participants
      this.sendRoomParticipants(quizId);
    } catch (error) {
      this.logger.error(error);
      client.emit('error', 'Failed to join quiz');
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('start-quiz')
  async handleStartQuiz(client: Socket, payload: { quizId: string }) {
    const user = client.data.user;
    const quizId = payload.quizId;

    if (!quizId) {
      client.emit('error', 'Quiz ID is required');
      return;
    }

    try {
      // Verify the user is the host or has permission to start the quiz
      const quiz = await this.quizService.findOne(quizId);
      if (quiz.creator.id !== user.id) {
        client.emit('error', 'Only the quiz creator can start the quiz');
        return;
      }

      // Get all questions for the quiz
      const questions = await this.questionsService.findByQuiz(quizId);

      if (questions.length === 0) {
        client.emit('error', 'Quiz has no questions');
        return;
      }

      // Initialize rankings via SSE
      await this.sseService.initializeQuizRankings(quizId);

      // Notify all players the quiz is starting
      this.server.to(quizId).emit('quiz-started', {
        message: 'Quiz is starting',
        totalQuestions: questions.length,
        quizTitle: quiz.title,
      });

      // Start the quiz by sending the first question
      await this.sendQuestion(quizId, 0, questions);
    } catch (error) {
      this.logger.error(error);
      client.emit('error', 'Failed to start quiz');
    }
  }

  private async sendQuestion(quizId: string, questionIndex: number, questions: Question[]) {
    if (questionIndex >= questions.length) {
      // Quiz is over
      await this.endQuiz(quizId);
      return;
    }

    const question = questions[questionIndex];
    const questionToSend = {
      id: question.id,
      text: question.text,
      options: question.options,
      timeLimit: question.timeLimit || 15, // Default to 15 seconds
      points: question.points || 100, // Default to 100 points
    };

    // Send question to all players
    this.server.to(quizId).emit('question', {
      question: questionToSend,
      index: questionIndex,
      total: questions.length,
      timeLimit: questionToSend.timeLimit,
    });

    // Set timeout for question duration
    const questionTimer = setTimeout(
      async () => {
        // Send correct answer after time is up
        this.server.to(quizId).emit('question-ended', {
          questionId: question.id,
          correctAnswer: question.correctAnswer,
        });

        // Update rankings via SSE
        await this.updateRankings(quizId);

        // Wait a moment before sending next question
        setTimeout(async () => {
          await this.sendQuestion(quizId, questionIndex + 1, questions);
        }, 3000);
      },
      questionToSend.timeLimit * 1000,
    );

    // Store the timer so we can clear it if needed
    this.activeQuizzes.set(quizId, questionTimer);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('submit-answer')
  async handleSubmitAnswer(
    client: Socket,
    payload: { quizId: string; questionId: string; answer: string },
  ) {
    const user = client.data.user;
    const { quizId, questionId, answer } = payload;

    if (!quizId || !questionId || !answer) {
      client.emit('error', 'Missing required fields');
      return;
    }

    try {
      // Get the question to validate answer
      const question = await this.questionsService.findOne(questionId);
      const isCorrect = question.correctAnswer === (typeof question.correctAnswer === 'number' ? Number(answer) : answer);
      const pointsEarned = isCorrect ? (question.points || 100) : 0;

      // Update rankings via SSE
      await this.sseService.updatePlayerScore(quizId, user.id, pointsEarned);

      // Notify the player
      client.emit('answer-result', {
        isCorrect,
        pointsEarned,
        correctAnswer: question.correctAnswer,
      });

      // Broadcast to all players that someone answered
      this.server.to(quizId).emit('player-answered', {
        userId: user.id,
        username: user.username,
        isCorrect,
      });
    } catch (error) {
      this.logger.error(error);
      client.emit('error', 'Failed to submit answer');
    }
  }

  private async updateRankings(quizId: string) {
    try {
      // Get current rankings from SSE service
      const rankings = await this.sseService.getCurrentRankings(quizId);
      if (rankings) {
        this.server.to(quizId).emit('rankings-update', rankings);
      }
    } catch (error) {
      this.logger.error('Failed to update rankings:', error);
    }
  }

  private async endQuiz(quizId: string) {
    try {
      // Clear any active timer
      this.cleanupQuiz(quizId);

      // Get final rankings from SSE service
      const finalRankings = await this.sseService.getCurrentRankings(quizId);

      // Notify all players the quiz has ended
      this.server.to(quizId).emit('quiz-ended', {
        message: 'Quiz has ended',
        rankings: finalRankings,
      });

      // Clean up SSE resources
      await this.sseService.finalizeQuizRankings(quizId);

      // Disconnect all clients after a delay
      setTimeout(() => {
        const room = this.server.sockets.adapter.rooms.get(quizId);
        if (room) {
          for (const socketId of room) {
            const socket = this.server.of('/quiz').sockets.get(socketId);
            if (socket) {
              socket.leave(quizId);
              socket.data.quizId = null;
            }
          }
        }
      }, 30000); // 30 seconds delay to allow clients to see results
    } catch (error) {
      this.logger.error(error);
      this.server.to(quizId).emit('error', 'Failed to end quiz properly');
    }
  }

  private cleanupQuiz(quizId: string) {
    const timer = this.activeQuizzes.get(quizId);
    if (timer) {
      clearTimeout(timer);
      this.activeQuizzes.delete(quizId);
    }
  }

  private async sendRoomParticipants(quizId: string) {
    const room = this.server.sockets.adapter.rooms.get(quizId);
    if (!room) return;

    const participants: { userId: any; username: any }[] = [];
    for (const socketId of room) {
      const socket = this.server.of('/quiz').sockets.get(socketId);
      if (socket && socket.data.user) {
        participants.push({
          userId: socket.data.user.id,
          username: socket.data.user.username,
        });
      }
    }

    this.server.to(quizId).emit('room-participants', {
      count: participants.length,
      participants,
    });
  }
}