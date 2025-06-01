import { Controller, Get, Param, Res, Req, Sse, Post, Body } from '@nestjs/common';
import { Response, Request } from 'express';
import { SseService } from './sse.service';
import { Observable, interval, map } from 'rxjs';
import { RankingUpdateDto } from './dtos/ranking-updates.dto';
import { SseClient } from './interfaces/sse.-client.interface';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse(':quizId/ranking')
  sse(@Param('quizId') quizId: string, @Req() req: Request): Observable<MessageEvent> {
    const clientId = req.headers['x-client-id'] as string || Date.now().toString();
    
    return new Observable((observer) => {
      const client: SseClient = {
        id: clientId,
        observer, // store observer instead of casting to Response
        quizId,
        userId: req.headers['x-user-id'] as string,
};

      this.sseService.addClient(quizId, client);

      req.on('close', () => {
        this.sseService.removeClient(quizId, clientId);
        observer.complete();
      });

      // Send initial empty data to establish connection
      observer.next({ data: { type: 'connected', clientId } } as MessageEvent);
    });
  }

@Post(':quizId/ranking/update')
createRankingUpdate(
  @Param('quizId') quizId: string,
  @Body() update: RankingUpdateDto
) {
  this.sseService.sendRankingUpdate(quizId, update);
  return { message: 'Ranking update broadcasted' };
}
}