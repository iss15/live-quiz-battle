import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';

export class SocketIoAdapter extends IoAdapter {
  constructor(private app: INestApplicationContext) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const serverOptions = {
    ...options,
    cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
    },
    } as ServerOptions;
    return super.createIOServer(port, serverOptions);
  }
}