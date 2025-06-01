import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateScoreDto {
  @ApiProperty()
  @IsString()
  @Field()
  quizId: string;

  @Field()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  points: number;

  @Field()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  correctAnswers: number;

  @Field()
  @ApiProperty()
  @IsNumber()
  @Min(0)
  totalTime: number;
}