import { Entity, Column, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Quiz } from './quiz.entity';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class Question extends BaseEntity {
  @Column()
  @Field()
  text: string;

  @Column('simple-json')
  @Field(() => [String])
  options: string[];

  @Column()
  @Field()
  correctAnswer: number; // index of correct option

  @Column({ default: 10 })
  @Field()
  points: number;

  @Column({ default: 30 })
  @Field()
  timeLimit: number; // in seconds

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @Field(() => Quiz)
  quiz: Quiz;
}