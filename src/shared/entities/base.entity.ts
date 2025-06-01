import { Field, ObjectType } from '@nestjs/graphql';
import { 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';

@ObjectType()
export abstract class BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}