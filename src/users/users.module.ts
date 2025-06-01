import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersResolver } from './user.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule), // Use forwardRef here
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}