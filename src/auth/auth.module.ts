import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // Make sure this exists
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { SwaggerModule } from '@nestjs/swagger'; // Add this import

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }), // Updated registration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],  
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule, PassportModule],  
})
export class AuthModule {}