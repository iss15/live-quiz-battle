import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { QuizStatus } from '../enums/quiz-status.enum';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateQuizDto {
  @IsString()
  @Field()
  title: string;

  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @IsEnum(QuizStatus)
  @IsOptional()
  @Field(() => QuizStatus, { defaultValue: QuizStatus.DRAFT })
  status?: QuizStatus;

  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  duration?: number;
}