import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { QuizStatus } from '../enums/quiz-status.enum';
import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@InputType()
export class CreateQuizDto {
  @ApiProperty({
    description: 'Title of the quiz',
    example: 'General Knowledge Quiz',
  })
  @IsString()
  @Field()
  title: string;

  @ApiPropertyOptional({
    description: 'Description of the quiz',
    example: 'A quiz to test general knowledge',
  })
  @IsString()
  @IsOptional()
  @Field({ nullable: true })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status of the quiz',
    enum: QuizStatus,
    default: QuizStatus.DRAFT,
  })
  @IsEnum(QuizStatus)
  @IsOptional()
  @Field(() => QuizStatus, { defaultValue: QuizStatus.DRAFT })
  status?: QuizStatus;

  @ApiPropertyOptional({
    description: 'Duration of the quiz in minutes',
    example: 60,
  })
  @IsNumber()
  @IsOptional()
  @Field({ nullable: true })
  duration?: number;
}
