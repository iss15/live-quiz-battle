import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Username (optional, non-empty string)',
    example: 'new_username',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiPropertyOptional({
    description: 'Email address (optional)',
    example: 'newemail@example.com',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'First name (optional)',
    example: 'John',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name (optional)',
    example: 'Doe',
  })
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;
}
