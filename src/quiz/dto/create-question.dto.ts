import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsArray, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class CreateQuestionDto {
  @Field()
  @IsString()
  text: string;

  @Field(() => [String])
  @IsArray()
  options: string[];

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  correctAnswer: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsNumber()
  @Min(1)
  points?: number;

  @Field(() => Int, { defaultValue: 30 })
  @IsNumber()
  @Min(5)
  @Max(120)
  timeLimit?: number;

  @Field()
  quizId: string;
}