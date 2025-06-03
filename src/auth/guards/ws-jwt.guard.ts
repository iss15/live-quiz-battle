import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger('WsJwtGuard');

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake.query.token as string;

    this.logger.log(`🔐 WS Guard - Token received: ${token}`);

    if (!token) {
      this.logger.warn('No token provided');
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);
      client.data.user = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
      };
      return true;
    } catch (err) {
      this.logger.error('Invalid JWT token', err);
      return false;
    }
  }
}
