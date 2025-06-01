import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Quiz } from './quiz.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Score extends BaseEntity {
  @Field()
  @Column({ default: 0 })
  points: number;

  @Field()
  @Column({ default: 0 })
  correctAnswers: number;

  @Field()
  @Column({ default: 0 })
  totalTime: number; // in seconds

  @Field(() => User)
  @ManyToOne(() => User, user => user.scores)
  user: User;

  @Field(() => Quiz)
  @ManyToOne(() => Quiz, quiz => quiz.scores)
  quiz: Quiz;
}