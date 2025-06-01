import { CreateQuizDto } from './create-quiz.dto';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateQuizDto extends PartialType(CreateQuizDto) {}