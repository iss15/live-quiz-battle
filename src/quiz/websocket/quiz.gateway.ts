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
    const quizId = client.data?.quizId;

    if (quizId) {
      client.leave(quizId);

      if (client.data?.user) {
        this.server.to(quizId).emit('player-left', {
          userId: client.data.user.id,
          username: client.data.user.username,
        });
      }

      const room = this.server.sockets.adapter.rooms.get(quizId);
      if (!room || room.size === 0) {
        this.cleanupQuiz(quizId);
      }
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-quiz')
  async handleJoinQuiz(client: Socket, payload: { quizId: string }) {
    console.log("joineddddd");
    const user = client.data.user as User;
    const quizId = payload.quizId;

    if (!user) {
      this.logger.warn('Missing user data in client');
      client.emit('error', 'Authentication required to join quiz');
      return;
    }

    if (!quizId) {
      client.emit('error', 'Quiz ID is required');
      return;
    }

    try {
      const quiz = await this.quizService.findOne(quizId);
      if (!quiz) {
        this.logger.warn(`Quiz with ID ${quizId} not found`);
        client.emit('error', 'Quiz not found');
        return;
      }

      client.data.quizId = quizId;
      client.data.user = user;
      await client.join(quizId);

      this.logger.log(`👤 ${user.username} joined quiz ${quizId}`);

      client.emit('joined-quiz', {
        quiz: {
          id: quiz.id,
          title: quiz.title,
        },
        user,
      });

      this.server.to(quizId).emit('player-joined', {
        userId: user.id,
        username: user.username,
        timestamp: new Date().toISOString(),
      });

      await this.sendRoomParticipants(quizId);
    } catch (error) {
      this.logger.error('Join quiz error:', error);
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
      const quiz = await this.quizService.findOne(quizId);
      if (!quiz || quiz.creator.id !== user.id) {
        client.emit('error', 'Only the quiz creator can start the quiz');
        return;
      }

      const questions = await this.questionsService.findByQuiz(quizId);
      if (questions.length === 0) {
        client.emit('error', 'Quiz has no questions');
        return;
      }

      await this.sseService.initializeQuizRankings(quizId);

      this.server.to(quizId).emit('quiz-started', {
        message: 'Quiz is starting',
        totalQuestions: questions.length,
        quizTitle: quiz.title,
      });

      await this.sendQuestion(quizId, 0, questions);
    } catch (error) {
      this.logger.error('Start quiz error:', error);
      client.emit('error', 'Failed to start quiz');
    }
  }

  private async sendQuestion(quizId: string, questionIndex: number, questions: Question[]) {
    if (questionIndex >= questions.length) {
      await this.endQuiz(quizId);
      return;
    }

    const question = questions[questionIndex];
    const questionToSend = {
      id: question.id,
      text: question.text,
      options: question.options,
      timeLimit: question.timeLimit || 15,
      points: question.points || 100,
    };

    this.server.to(quizId).emit('question', {
      question: questionToSend,
      index: questionIndex,
      total: questions.length,
      timeLimit: questionToSend.timeLimit,
    });

    const timer = setTimeout(async () => {
      this.server.to(quizId).emit('question-ended', {
        questionId: question.id,
        correctAnswer: question.correctAnswer,
      });

      await this.updateRankings(quizId);

      setTimeout(() => this.sendQuestion(quizId, questionIndex + 1, questions), 3000);
    }, questionToSend.timeLimit * 1000);

    this.activeQuizzes.set(quizId, timer);
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
      const question = await this.questionsService.findOne(questionId);
      const isCorrect =
        question.correctAnswer === (typeof question.correctAnswer === 'number' ? Number(answer) : answer);
      const points = isCorrect ? question.points || 100 : 0;

      await this.sseService.updatePlayerScore(quizId, user.id, points);

      client.emit('answer-result', {
        isCorrect,
        pointsEarned: points,
        correctAnswer: question.correctAnswer,
      });

      this.server.to(quizId).emit('player-answered', {
        userId: user.id,
        username: user.username,
        isCorrect,
      });
    } catch (error) {
      this.logger.error('Submit answer error:', error);
      client.emit('error', 'Failed to submit answer');
    }
  }

  private async updateRankings(quizId: string) {
    try {
      const rankings = await this.sseService.getCurrentRankings(quizId);
      if (rankings) {
        this.server.to(quizId).emit('rankings-update', rankings);
      }
    } catch (error) {
      this.logger.error('Update rankings error:', error);
    }
  }

  private async endQuiz(quizId: string) {
    try {
      this.cleanupQuiz(quizId);
      const finalRankings = await this.sseService.getCurrentRankings(quizId);

      this.server.to(quizId).emit('quiz-ended', {
        message: 'Quiz has ended',
        rankings: finalRankings,
      });

      await this.sseService.finalizeQuizRankings(quizId);

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
      }, 30000);
    } catch (error) {
      this.logger.error('End quiz error:', error);
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
  try {
    // Récupérer tous les sockets dans la room (async)
    const sockets = await this.server.in(quizId).fetchSockets();

    interface Participant {
      userId: string;
      username: string;
    }

    const participants: Participant[] = [];

    for (const socket of sockets) {
      if (socket.data?.user) {
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
  } catch (error) {
    this.logger.error('sendRoomParticipants error:', error);
  }
}



}
