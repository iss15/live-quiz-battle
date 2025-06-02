import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsArray, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CreateQuestionDto {
  @ApiProperty({
    description: 'Text of the question',
    example: 'What is the capital of France?',
  })
  @Field()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'List of possible answer options',
    example: ['Paris', 'London', 'Berlin', 'Madrid'],
    type: [String],
  })
  @Field(() => [String])
  @IsArray()
  options: string[];

  @ApiProperty({
    description: 'Index of the correct answer in the options array',
    example: 0,
    minimum: 0,
  })
  @Field(() => Int)
  @IsNumber()
  @Min(0)
  correctAnswer: number;

  @ApiPropertyOptional({
    description: 'Points awarded for the question',
    example: 10,
    minimum: 1,
    default: 10,
  })
  @Field(() => Int, { defaultValue: 10 })
  @IsNumber()
  @Min(1)
  points?: number;

  @ApiPropertyOptional({
    description: 'Time limit to answer the question (in seconds)',
    example: 30,
    minimum: 5,
    maximum: 120,
    default: 30,
  })
  @Field(() => Int, { defaultValue: 30 })
  @IsNumber()
  @Min(5)
  @Max(120)
  timeLimit?: number;

  @ApiProperty({
    description: 'ID of the quiz this question belongs to',
    example: 'a1b2c3d4',
  })
  @Field()
  quizId: string;
}
