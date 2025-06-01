import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Quiz } from '../../quiz/entities/quiz.entity';
import { Score } from '../../quiz/entities/score.entity';
import { UserRole } from '../enums/user-role.enum';
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @Column({ unique: true })
  username: string;

  @Field()
  @Column()
  password: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field(() => UserRole, { defaultValue: UserRole.PLAYER })
  @Column({ 
    type: 'enum',
    enum: UserRole,
    default: UserRole.PLAYER 
  })
  role: UserRole;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Field(() => [Quiz])
  @OneToMany(() => Quiz, quiz => quiz.creator)
  quizzes: Quiz[];

  @Field(() => [Score])
  @OneToMany(() => Score, score => score.user)
  scores: Score[];
}