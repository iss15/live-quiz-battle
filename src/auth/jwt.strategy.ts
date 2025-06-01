import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) { 
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        const secret = configService.get<string>('JWT_SECRET');
        done(null, secret);
      },
    });
  }

  async validate(payload: any): Promise<Partial<User>> {
    return { 
      id: payload.sub, 
      username: payload.username,
      role: payload.role 
    };
  }
}


