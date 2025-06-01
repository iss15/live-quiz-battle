import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuizModule } from './quiz/quiz.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { SseModule } from './sse/sse.module';
import { QuizWebSocketModule } from './quiz/websocket/quiz-websocket.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      context: ({ req, res }) => ({ req, res }), 
      driver: ApolloDriver,
      autoSchemaFile: true,
      subscriptions: {
        'graphql-ws': true,
      }}),
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    QuizModule,
    SseModule,
    QuizWebSocketModule,
  ],
})
export class AppModule {}