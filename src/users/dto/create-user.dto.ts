import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { UserRole } from '../enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username between 4 and 20 characters',
    minLength: 4,
    maxLength: 20,
    example: 'john_doe',
  })
  @Field()
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({
    description:
      'Strong password between 8 and 32 characters with at least one uppercase letter, one lowercase letter, and one digit or special character',
    minLength: 8,
    maxLength: 32,
    example: 'StrongP@ssw0rd',
  })
  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({
    description: 'Valid email address',
    example: 'john@example.com',
  })
  @Field()
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: UserRole,
    description: 'User role (defaults to PLAYER)',
    default: UserRole.PLAYER,
    required: false,
  })
  @Field(() => UserRole, { defaultValue: UserRole.PLAYER })
  role?: UserRole;

  @ApiProperty({
    description: 'URL to user avatar',
    example: 'https://example.com/avatar.png',
    required: false,
  })
  @Field({ nullable: true })
  avatarUrl?: string;
}
