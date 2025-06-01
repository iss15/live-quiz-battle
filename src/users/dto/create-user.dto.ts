import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { In } from 'typeorm';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @Field()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => UserRole, { defaultValue: UserRole.PLAYER })
  role?: UserRole.PLAYER;

  @Field({ nullable: true })
  avatarUrl?: string;
}