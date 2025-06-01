import { registerEnumType } from "@nestjs/graphql";

export enum QuizStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(QuizStatus, {
  name: 'QuizStatus',
  description: 'The status of a quiz',
});