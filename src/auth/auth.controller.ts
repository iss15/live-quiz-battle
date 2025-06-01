import { Controller, Get, Post, Body, Query, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  @Get('login')
  async loginGet(@Query('email') email: string, @Query('password') pass: string) {
    const user = await this.authService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) { 
    const newUser = await this.usersService.create(createUserDto); 
    const { password, ...userPreview } = newUser;
    return this.authService.login(userPreview);  
  }
}