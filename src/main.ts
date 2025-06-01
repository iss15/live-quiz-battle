import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { SocketIoAdapter } from './shared/websockets/ws-adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
    // Enable CORS for REST and GraphQL endpoints
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Use our custom WebSocket adapter
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Live Quiz Battle API')
    .setDescription('The API documentation for Live Quiz Battle application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();