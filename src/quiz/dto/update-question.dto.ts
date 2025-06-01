import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { CreateQuestionDto } from './create-question.dto';

@InputType()
export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
}