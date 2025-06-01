import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsEmail, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateUserDto {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

}