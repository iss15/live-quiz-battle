import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { SseService } from './sse.service';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [UsersModule],   // <-- import UsersModule here

  controllers: [SseController],
  providers: [SseService],
  exports: [SseService],
})
export class SseModule {}