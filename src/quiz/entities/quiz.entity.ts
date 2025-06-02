import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Question } from './question.entity';
import { Score } from './score.entity';
import { QuizStatus } from '../enums/quiz-status.enum';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Quiz extends BaseEntity {
  @Field()
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column({ 
    type: 'enum',
    enum: QuizStatus,
    default: QuizStatus.DRAFT 
  })
  @Field(() => QuizStatus, { defaultValue: QuizStatus.DRAFT })
  status: QuizStatus;

  @Field({ nullable: true })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startTime?: Date;

  @Field({ nullable: true })
  @Column({ default: 0 })
  duration: number; // in minutes

  @Field(() => User)
  @ManyToOne(() => User, user => user.quizzes)
  creator: User;

  @Field(() => [Question])
  @OneToMany(() => Question, question => question.quiz)
  questions: Question[];

  @Field(() => [Score])
  @OneToMany(() => Score, score => score.quiz)
  scores: Score[];
}